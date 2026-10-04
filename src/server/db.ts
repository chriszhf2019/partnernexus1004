import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "momentum.db");

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// 初始化表结构
export function initDatabase() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      tier TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now')),
      last_login_at TEXT,
      onboarding_completed INTEGER DEFAULT 0,
      theme_preference TEXT DEFAULT 'midnight'
    )
  `);

  // 种子表
  db.exec(`
    CREATE TABLE IF NOT EXISTS seeds (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT '萌芽',
      progress INTEGER DEFAULT 0,
      momentum_score INTEGER DEFAULT 0,
      description TEXT,
      deadline TEXT,
      expected_growth INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 联系人表
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      resonance_frequency TEXT DEFAULT '月',
      last_interaction_date TEXT DEFAULT (datetime('now')),
      shared_ripples_count INTEGER DEFAULT 0,
      first_met_date TEXT DEFAULT (date('now')),
      meet_source TEXT,
      introducer_id TEXT,
      tags TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 迁移：为旧数据库添加新字段
  const columns = db.prepare("PRAGMA table_info(contacts)").all() as any[];
  const colNames = columns.map(c => c.name);
  if (!colNames.includes("first_met_date")) {
    db.exec("ALTER TABLE contacts ADD COLUMN first_met_date TEXT DEFAULT (date('now'))");
  }
  if (!colNames.includes("meet_source")) {
    db.exec("ALTER TABLE contacts ADD COLUMN meet_source TEXT");
  }
  if (!colNames.includes("introducer_id")) {
    db.exec("ALTER TABLE contacts ADD COLUMN introducer_id TEXT");
  }

  // 联系人互动记录
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_interactions (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      interaction_date TEXT DEFAULT (datetime('now')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 成就表
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      desc TEXT,
      ripple_depth INTEGER DEFAULT 1,
      collaborator_ids TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 善意记录
  db.exec(`
    CREATE TABLE IF NOT EXISTS kindness_ripples (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target TEXT NOT NULL,
      action TEXT NOT NULL,
      depth INTEGER DEFAULT 1,
      date TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 智慧库
  db.exec(`
    CREATE TABLE IF NOT EXISTS wisdom_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      context TEXT,
      methodology TEXT,
      tags TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 成长轨迹节点
  db.exec(`
    CREATE TABLE IF NOT EXISTS trajectory_nodes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      g_value INTEGER DEFAULT 0,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 季罗盘目标
  db.exec(`
    CREATE TABLE IF NOT EXISTS quarterly_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      direction TEXT NOT NULL,
      title TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 周日记
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_journal (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      week_start TEXT NOT NULL,
      content TEXT,
      coach_extraction TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, week_start),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 打卡记录
  db.exec(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      check_in_date TEXT NOT NULL,
      streak_count INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, check_in_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 索引
  db.exec(`CREATE INDEX IF NOT EXISTS idx_seeds_user ON seeds(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_kindness_user ON kindness_ripples(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_wisdom_user ON wisdom_items(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_trajectory_user ON trajectory_nodes(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_checkins_user ON check_ins(user_id, check_in_date)`);

  console.log("[DB] Database initialized successfully at:", DB_PATH);
}

initDatabase();
