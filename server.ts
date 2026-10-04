import express from "express";
import path from "path";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

import { logger, logRequest } from "./src/server/logger";
import { optionalAuth } from "./src/server/auth";
import apiRoutes from "./src/server/routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

// 信任 Nginx 反向代理（用于正确获取客户端 IP）
app.set("trust proxy", 1);

// 禁用 x-powered-by
app.disable("x-powered-by");

// ============ 安全中间件 ============

// Helmet - 安全 HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 压缩
app.use(compression());

// 速率限制 - 全局
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 300, // 每个 IP 最多 300 次请求
  message: { error: "请求过于频繁，请稍后再试" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// 认证相关接口的更严格限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 15分钟内最多10次登录/注册
  message: { error: "认证请求过于频繁，请稍后再试" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body 解析
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// 请求日志
app.use(logRequest);

// ============ Gemini AI 客户端 ============
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: { "User-Agent": "momentum-prod" },
      },
    });
    logger.info("Gemini client initialized");
  } catch (error: any) {
    logger.error("Failed to initialize Gemini client", { error: error.message });
  }
} else {
  logger.warn("GEMINI_API_KEY not configured, using fallback mode");
}

// ============ 健康检查 ============
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============ API 路由 ============

// 认证路由（更严格的速率限制）
app.use("/api/auth", authLimiter, apiRoutes);

// 其他 API
app.use("/api", optionalAuth, apiRoutes);

// AI Coach
app.post("/api/coach", optionalAuth, async (req, res) => {
  const { weeklySeeds, journalText, achievements, contacts } = req.body;

  const seedsSummary = (weeklySeeds || []).map((s: any) => `- [${s.category}] ${s.title} (${s.status})`).join("\n");
  const achievementsSummary = (achievements || []).map((a: any) => `- [成就] ${a.title}: ${a.desc}`).join("\n");
  const contactsSummary = (contacts || []).map((c: any) => `- [人脉] 结识 ${c.name} (标签: ${c.type})`).join("\n");

  const prompt = `
你现在是 Momentum (念) 这一款人生管理应用内置的 AI 观察员 (Momentum Coach)。
你的任务不是督促或责备用户，而是帮助用户"发现生命中的光、能量积累与对他人的微小影响"。
请基于以下用户本周记录的内容，撰写一篇优美、积极、充满禅意、富有洞察力且不超过250字的"周末萃取 (Weekend Harvest)"报告。

【用户本周的生长印记】：
1. 律动种子/生长目标：
${seedsSummary || "（无目标设定）"}

2. 本周日记/琐碎想法：
"${journalText || "（用户仅记录了日常成长，未写额外文字）"}"

3. 创造的涟漪（本周成就）：
${achievementsSummary || "（无新增资产块）"}

4. 星系闪烁（本周结识的人脉节点）：
${contactsSummary || "（无新增关系节点）"}

【撰写指南】：
- 严禁使用"截止日期"、"死前"、"倒计时"、"任务"、"拖延"、"失败"等负面、催促词汇。
- 改用"生长点"、"绽放时刻"、"动能"、"静思"、"滋养"、"引力"等积极词汇。
- 文字要具有中文美感，优美和煦，像朋友在晨曦中的低语。
- 重点指出用户本周展现出的【核心动能 (Momentum)】和对他人或周围世界产生的微小【涟漪影响 (Ripple Impact)】。
- 分为三个小段：[生命律动]、[星系回响]、[动能启迪]。
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        config: {
          systemInstruction:
            "你是一位精通'数字禅'与'生命增值学'的 Momentum AI 导师，善于从琐碎日常中发现生命之光和引力传递，语气温暖、深刻、具有中国传统美学底蕴。",
        },
      });

      const coachFeedback =
        response.text ||
        "生命在静默中生长。你在这一周种下的种子，正在以不易察觉的速度向下扎根。";
      return res.json({ success: true, text: coachFeedback });
    } catch (error: any) {
      logger.error("Gemini API call failed", { error: error.message });
      return res.status(500).json({
        success: false,
        error: "AI Coach has a temporary latency. Please try again.",
        fallback: generateMockFeedback(weeklySeeds, journalText, achievements, contacts),
      });
    }
  } else {
    return res.json({
      success: true,
      text: generateMockFeedback(weeklySeeds, journalText, achievements, contacts),
      simulated: true,
    });
  }
});

function generateMockFeedback(weeklySeeds: any[], journalText: string, achievements: any[], contacts: any[]): string {
  const activeCount = (weeklySeeds || []).filter(s => s.status === "绽放").length;
  const totalCount = (weeklySeeds || []).length;

  return `【生命律动】
在本周的律动中，你默默呵护着 ${totalCount} 颗生长种子。其中，有 ${activeCount} 颗种子迎来了绽放时刻。那些在清晨与静夜里付出的时间，不是生命的损耗，而是能量的层层积累。

【星系回响】
在你的脉络星系中，引力的波纹正缓缓荡开。${contacts && contacts.length > 0 ? `你与 ${contacts[0].name} 等独特的心灵建立起了连结，这不仅是人脉的扩张，更是灵感的共振。` : "你虽然本周处于静思和自我沉淀期，但你过去种下的善意涟漪，依然在悄无声息地滋养着周围的世界。"}每一个成就资产的垒起，都是你对这个世界产生的独一无二的回响。

【动能启迪】
生命短短，不看余晖，看星光。下周，让动能继续轻盈流淌，静待下一处生长点的萌芽。`;
}

// 静态文件服务
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    logger.info("Vite dev middleware mounted");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        maxAge: "1y",
        immutable: true,
        index: false,
      })
    );
    // robots.txt 和 sitemap.xml
    app.get("/robots.txt", (_req, res) => {
      res.type("text/plain");
      res.send(`User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://mo.velolabs.top/sitemap.xml`);
    });
    app.get("/sitemap.xml", (_req, res) => {
      res.type("application/xml");
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mo.velolabs.top/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mo.velolabs.top/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://mo.velolabs.top/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
    });

    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    logger.info("Production static files serving configured");
  }

  // 错误处理
  app.use((err: any, _req: any, res: any, _next: any) => {
    logger.error("Unhandled error", { error: err.message, stack: err.stack });
    res.status(500).json({ error: "服务器内部错误" });
  });

  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: "接口不存在" });
  });

  // 启动 HTTP 服务
  const server = http.createServer(app);
  server.listen(PORT, "0.0.0.0", () => {
    logger.info(`Momentum server listening on port ${PORT}`, {
      env: process.env.NODE_ENV,
      pid: process.pid,
    });
  });

  // 优雅关闭
  const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced shutdown");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer();
