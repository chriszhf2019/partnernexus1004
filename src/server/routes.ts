import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { body, validationResult } from "express-validator";
import { db } from "./db";
import {
  authMiddleware,
  hashPassword,
  verifyPassword,
  signToken,
  validateEmail,
  validatePassword,
  generateUserId,
  AuthRequest,
} from "./auth";
import { logger } from "./logger";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

// ============ 认证路由 ============

// 注册
router.post(
  "/auth/register",
  [
    body("email").isString().trim(),
    body("password").isString(),
    body("name").optional().isString().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "请求数据无效" });
      }

      const { email, password, name } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      if (!validateEmail(normalizedEmail)) {
        return res.status(400).json({ error: "邮箱格式不正确" });
      }

      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return res.status(400).json({ error: passwordCheck.message });
      }

      // 检查邮箱是否已注册
      const existing = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(normalizedEmail);
      if (existing) {
        return res.status(409).json({ error: "该邮箱已注册" });
      }

      // 创建用户
      const userId = generateUserId();
      const passwordHash = await hashPassword(password);

      db.prepare(
        `INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)`
      ).run(userId, normalizedEmail, passwordHash, name || null);

      const token = signToken(userId);

      // 设置 cookie
      res.cookie("token", token, COOKIE_OPTIONS);

      logger.info("User registered", { userId, email: normalizedEmail });

      res.json({
        success: true,
        token,
        user: {
          id: userId,
          email: normalizedEmail,
          name: name || null,
          tier: "free",
        },
      });
    } catch (error: any) {
      logger.error("Registration error", { error: error.message });
      res.status(500).json({ error: "注册失败，请稍后重试" });
    }
  }
);

// 登录
router.post(
  "/auth/login",
  [body("email").isString().trim(), body("password").isString()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "请求数据无效" });
      }

      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = db
        .prepare(
          "SELECT id, email, password_hash, name, tier FROM users WHERE email = ?"
        )
        .get(normalizedEmail) as any;

      if (!user) {
        return res.status(401).json({ error: "邮箱或密码不正确" });
      }

      const validPassword = await verifyPassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: "邮箱或密码不正确" });
      }

      // 更新最后登录时间
      db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(
        user.id
      );

      const token = signToken(user.id);

      res.cookie("token", token, COOKIE_OPTIONS);

      logger.info("User logged in", { userId: user.id, email: user.email });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
        },
      });
    } catch (error: any) {
      logger.error("Login error", { error: error.message });
      res.status(500).json({ error: "登录失败，请稍后重试" });
    }
  }
);

// 登出
router.post("/auth/logout", (_req: AuthRequest, res: Response) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ success: true });
});

// 获取当前用户信息
router.get("/auth/me", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db
    .prepare(
      "SELECT id, email, name, tier, onboarding_completed, theme_preference FROM users WHERE id = ?"
    )
    .get(req.user!.id) as any;

  res.json({ user });
});

// 更新用户偏好
router.patch(
  "/auth/preferences",
  authMiddleware,
  [
    body("theme").optional().isString(),
    body("onboardingCompleted").optional().isBoolean(),
  ],
  (req: AuthRequest, res: Response) => {
    try {
      const { theme, onboardingCompleted } = req.body;

      if (theme !== undefined) {
        db.prepare("UPDATE users SET theme_preference = ? WHERE id = ?").run(
          theme,
          req.user!.id
        );
      }

      if (onboardingCompleted !== undefined) {
        db.prepare(
          "UPDATE users SET onboarding_completed = ? WHERE id = ?"
        ).run(onboardingCompleted ? 1 : 0, req.user!.id);
      }

      res.json({ success: true });
    } catch (error: any) {
      logger.error("Update preferences error", { error: error.message });
      res.status(500).json({ error: "更新失败" });
    }
  }
);

// ============ 数据同步 API ============

// 获取所有用户数据
router.get("/data/all", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const seeds = db
      .prepare("SELECT * FROM seeds WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId);

    const contacts = db
      .prepare("SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId);

    const achievements = db
      .prepare(
        "SELECT * FROM achievements WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(userId);

    const kindnessRipples = db
      .prepare(
        "SELECT * FROM kindness_ripples WHERE user_id = ? ORDER BY date DESC"
      )
      .all(userId);

    const wisdomItems = db
      .prepare("SELECT * FROM wisdom_items WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId);

    const trajectoryNodes = db
      .prepare(
        "SELECT * FROM trajectory_nodes WHERE user_id = ? ORDER BY timestamp DESC"
      )
      .all(userId);

    const quarterlyGoals = db
      .prepare("SELECT * FROM quarterly_goals WHERE user_id = ?")
      .all(userId);

    // 字段名映射（数据库 -> 前端）
    const mapContact = (c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      resonanceFrequency: c.resonance_frequency || "月",
      lastInteractionDate: c.last_interaction_date?.split("T")[0]?.split(" ")[0] || new Date().toISOString().split("T")[0],
      sharedRipplesCount: c.shared_ripples_count || 0,
      firstMetDate: c.first_met_date || c.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      meetSource: c.meet_source || "其他",
      introducerId: c.introducer_id || null,
      introducerName: c.introducer_name || null,
      tags: c.tags ? JSON.parse(c.tags) : [],
      notes: c.notes,
    });

    const mapSeed = (s: any) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      status: s.status,
      progress: s.progress,
      momentumScore: s.momentum_score,
      description: s.description,
      deadline: s.deadline,
      expectedGrowth: s.expected_growth,
      createdAt: s.created_at,
    });

    const mapAchievement = (a: any) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      desc: a.desc,
      rippleDepth: a.ripple_depth,
      collaboratorIds: a.collaborator_ids ? JSON.parse(a.collaborator_ids) : [],
    });

    const mapKindness = (k: any) => ({
      id: k.id,
      target: k.target,
      action: k.action,
      depth: k.depth,
      date: k.date,
    });

    const mapWisdom = (w: any) => ({
      id: w.id,
      title: w.title,
      context: w.context,
      methodology: w.methodology,
      tags: w.tags ? JSON.parse(w.tags) : [],
    });

    const mapTrajectory = (t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      gValue: t.g_value,
      timestamp: t.timestamp,
    });

    const mapQuarterly = (q: any) => ({
      id: q.id,
      direction: q.direction,
      title: q.title,
      progress: q.progress,
    });

    res.json({
      seeds: (seeds as any[]).map(mapSeed),
      contacts: (contacts as any[]).map(mapContact),
      achievements: (achievements as any[]).map(mapAchievement),
      kindnessRipples: (kindnessRipples as any[]).map(mapKindness),
      wisdomItems: (wisdomItems as any[]).map(mapWisdom),
      trajectoryNodes: (trajectoryNodes as any[]).map(mapTrajectory),
      quarterlyGoals: (quarterlyGoals as any[]).map(mapQuarterly),
    });
  } catch (error: any) {
    logger.error("Get all data error", { error: error.message, userId: req.user?.id });
    res.status(500).json({ error: "数据获取失败" });
  }
});

// 同步所有数据（全量替换）
router.post(
  "/data/sync",
  authMiddleware,
  (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const {
      seeds = [],
      contacts = [],
      achievements = [],
      kindnessRipples = [],
      wisdomItems = [],
      trajectoryNodes = [],
      quarterlyGoals = [],
    } = req.body;

    const transaction = db.transaction(() => {
      // 清空旧数据
      db.prepare("DELETE FROM seeds WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM contacts WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM achievements WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM kindness_ripples WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM wisdom_items WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM trajectory_nodes WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM quarterly_goals WHERE user_id = ?").run(userId);

      // 插入新数据
      const insertSeed = db.prepare(
        `INSERT INTO seeds (id, user_id, title, category, status, progress, momentum_score, description, deadline, expected_growth) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      for (const s of seeds) {
        insertSeed.run(
          s.id || `seed-${uuidv4()}`,
          userId,
          s.title,
          s.category,
          s.status || "萌芽",
          s.progress || 0,
          s.momentumScore || 0,
          s.description || null,
          s.deadline || null,
          s.expectedGrowth || null
        );
      }

      const insertContact = db.prepare(
        `INSERT INTO contacts (id, user_id, name, type, resonance_frequency, last_interaction_date, shared_ripples_count, first_met_date, meet_source, introducer_id, tags, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      for (const c of contacts) {
        insertContact.run(
          c.id || `contact-${uuidv4()}`,
          userId,
          c.name,
          c.type,
          c.resonanceFrequency || "月",
          c.lastInteractionDate || new Date().toISOString(),
          c.sharedRipplesCount || 0,
          c.firstMetDate || new Date().toISOString().split("T")[0],
          c.meetSource || "其他",
          c.introducerId || null,
          JSON.stringify(c.tags || []),
          c.notes || null
        );
      }

      const insertAchievement = db.prepare(
        `INSERT INTO achievements (id, user_id, title, category, desc, ripple_depth, collaborator_ids) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      for (const a of achievements) {
        insertAchievement.run(
          a.id || `achv-${uuidv4()}`,
          userId,
          a.title,
          a.category,
          a.desc || null,
          a.rippleDepth || 1,
          JSON.stringify(a.collaboratorIds || [])
        );
      }

      const insertKindness = db.prepare(
        `INSERT INTO kindness_ripples (id, user_id, target, action, depth, date) 
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      for (const k of kindnessRipples) {
        insertKindness.run(
          k.id || `kind-${uuidv4()}`,
          userId,
          k.target,
          k.action,
          k.depth || 1,
          k.date || new Date().toISOString()
        );
      }

      const insertWisdom = db.prepare(
        `INSERT INTO wisdom_items (id, user_id, title, context, methodology, tags) 
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      for (const w of wisdomItems) {
        insertWisdom.run(
          w.id || `wisdom-${uuidv4()}`,
          userId,
          w.title,
          w.context || null,
          w.methodology || null,
          JSON.stringify(w.tags || [])
        );
      }

      const insertTrajectory = db.prepare(
        `INSERT INTO trajectory_nodes (id, user_id, title, description, category, g_value, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      for (const t of trajectoryNodes) {
        insertTrajectory.run(
          t.id || `traj-${uuidv4()}`,
          userId,
          t.title,
          t.description || null,
          t.category || null,
          t.gValue || 0,
          t.timestamp || new Date().toISOString()
        );
      }

      const insertQuarterly = db.prepare(
        `INSERT INTO quarterly_goals (id, user_id, direction, title, progress) 
         VALUES (?, ?, ?, ?, ?)`
      );
      for (const q of quarterlyGoals) {
        insertQuarterly.run(
          q.id || `q-${uuidv4()}`,
          userId,
          q.direction,
          q.title,
          q.progress || 0
        );
      }
    });

    try {
      transaction();
      logger.info("Data synced", { userId, counts: { seeds: seeds.length, contacts: contacts.length } });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("Sync data error", { error: error.message, userId });
      res.status(500).json({ error: "数据同步失败" });
    }
  }
);

// ============ 打卡 API ============

router.post("/checkin", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split("T")[0];

    // 检查今天是否已打卡
    const existing = db
      .prepare("SELECT * FROM check_ins WHERE user_id = ? AND check_in_date = ?")
      .get(userId, today);

    if (existing) {
      return res.json({
        success: false,
        alreadyCheckedIn: true,
        streak: (existing as any).streak_count,
      });
    }

    // 计算连续打卡天数
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const yesterdayCheckin = db
      .prepare("SELECT streak_count FROM check_ins WHERE user_id = ? AND check_in_date = ?")
      .get(userId, yesterday) as any;

    const streak = yesterdayCheckin ? yesterdayCheckin.streak_count + 1 : 1;

    db.prepare(
      "INSERT INTO check_ins (id, user_id, check_in_date, streak_count) VALUES (?, ?, ?, ?)"
    ).run(`ci-${uuidv4()}`, userId, today, streak);

    res.json({ success: true, streak, isNew: true });
  } catch (error: any) {
    logger.error("Check-in error", { error: error.message });
    res.status(500).json({ error: "打卡失败" });
  }
});

router.get("/checkin", authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split("T")[0];

    const todayCheckin = db
      .prepare("SELECT * FROM check_ins WHERE user_id = ? AND check_in_date = ?")
      .get(userId, today);

    const recentCheckins = db
      .prepare(
        "SELECT check_in_date, streak_count FROM check_ins WHERE user_id = ? ORDER BY check_in_date DESC LIMIT 30"
      )
      .all(userId);

    res.json({
      canCheckIn: !todayCheckin,
      recentStreak: todayCheckin ? (todayCheckin as any).streak_count : 0,
      history: recentCheckins,
    });
  } catch (error: any) {
    logger.error("Get checkin error", { error: error.message });
    res.status(500).json({ error: "获取打卡信息失败" });
  }
});

export default router;
