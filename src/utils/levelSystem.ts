import { WeeklySeed, GalaxyNode, Achievement, KindnessRecord, WisdomBankItem } from "../types";

// 等级定义
export interface LevelConfig {
  level: number;
  name: string;
  icon: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: "萌芽者",
    icon: "🌱",
    minScore: 0,
    maxScore: 100,
    description: "刚刚踏上成长之路，一切都充满可能",
  },
  {
    level: 2,
    name: "生长者",
    icon: "🌿",
    minScore: 100,
    maxScore: 300,
    description: "持续吸收养分，正在向上生长",
  },
  {
    level: 3,
    name: "绽放者",
    icon: "🌸",
    minScore: 300,
    maxScore: 600,
    description: "生命开始绽放，影响周围的人",
  },
  {
    level: 4,
    name: "引路人",
    icon: "✨",
    minScore: 600,
    maxScore: 1200,
    description: "用自己的光照亮他人的道路",
  },
  {
    level: 5,
    name: "大师",
    icon: "🌟",
    minScore: 1200,
    maxScore: 2500,
    description: "内外皆修，成为他人仰望的存在",
  },
  {
    level: 6,
    name: "传奇",
    icon: "🌌",
    minScore: 2500,
    maxScore: 5000,
    description: "你的影响力跨越时间与空间",
  },
  {
    level: 7,
    name: "恒星",
    icon: "💫",
    minScore: 5000,
    maxScore: Infinity,
    description: "永恒闪耀，指引方向",
  },
];

// 徽章定义
export interface BadgeConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: "成长" | "关系" | "影响" | "特殊";
  check: (seeds: WeeklySeed[], contacts: GalaxyNode[], achievements: Achievement[], kindness: KindnessRecord[], wisdom: WisdomBankItem[]) => boolean;
}

export const BADGES: BadgeConfig[] = [
  // 成长类
  {
    id: "first-bloom",
    name: "初次绽放",
    icon: "🌺",
    description: "种下的第一颗种子绽放了",
    category: "成长",
    check: (seeds) => seeds.some((s) => s.status === "绽放"),
  },
  {
    id: "five-blooms",
    name: "繁花似锦",
    icon: "🌻",
    description: "让 5 颗以上种子绽放",
    category: "成长",
    check: (seeds) => seeds.filter((s) => s.status === "绽放").length >= 5,
  },
  {
    id: "all-categories",
    name: "全面发展",
    icon: "🌈",
    description: "五个成长维度都有种子",
    category: "成长",
    check: (seeds) => {
      const categories = new Set(seeds.map((s) => s.category));
      return categories.size >= 5;
    },
  },
  // 关系类
  {
    id: "first-connection",
    name: "星系初成",
    icon: "⭐",
    description: "添加第一颗人脉节点",
    category: "关系",
    check: (_, contacts) => contacts.length >= 1,
  },
  {
    id: "ten-connections",
    name: "人脉网络",
    icon: "🌐",
    description: "拥有 10 个以上人脉节点",
    category: "关系",
    check: (_, contacts) => contacts.length >= 10,
  },
  {
    id: "healthy-relationships",
    name: "关系滋养者",
    icon: "💚",
    description: "80% 以上关系保持健康互动",
    category: "关系",
    check: (_, contacts) => {
      if (contacts.length === 0) return false;
      const healthyCount = contacts.filter((c) => {
        const days = Math.floor((Date.now() - new Date(c.lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24));
        const threshold = c.resonanceFrequency === "周" ? 7 : c.resonanceFrequency === "月" ? 30 : c.resonanceFrequency === "季" ? 90 : 365;
        return days <= threshold;
      }).length;
      return (healthyCount / contacts.length) >= 0.8;
    },
  },
  // 影响类
  {
    id: "first-kindness",
    name: "善意涟漪",
    icon: "💖",
    description: "完成第一次善意涟漪",
    category: "影响",
    check: (_, __, ___, kindness) => kindness.length >= 1,
  },
  {
    id: "wisdom-sharer",
    name: "智慧分享者",
    icon: "📚",
    description: "在智慧库中存入 5 条以上智慧",
    category: "影响",
    check: (_, __, ___, ____, wisdom) => wisdom.length >= 5,
  },
  // 特殊类
  {
    id: "perfect-day",
    name: "完美一天",
    icon: "☀️",
    description: "同一天推进 3 颗以上种子生长",
    category: "特殊",
    check: (seeds) => {
      const today = new Date().toISOString().split("T")[0];
      const todaySeeds = seeds.filter((s) => s.createdAt === today);
      return todaySeeds.length >= 3;
    },
  },
];

// 获取当前等级
export function getCurrentLevel(score: number): LevelConfig {
  return (
    LEVELS.find((l) => score >= l.minScore && score < l.maxScore) || LEVELS[LEVELS.length - 1]
  );
}

// 获取下一等级
export function getNextLevel(score: number): LevelConfig | null {
  const current = getCurrentLevel(score);
  const currentIndex = LEVELS.findIndex((l) => l.level === current.level);
  return currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
}

// 获取等级进度百分比
export function getLevelProgress(score: number): number {
  const current = getCurrentLevel(score);
  const next = getNextLevel(score);
  if (!next) return 100;
  const range = next.minScore - current.minScore;
  const progress = score - current.minScore;
  return Math.min(100, Math.round((progress / range) * 100));
}

// 获取已获得的徽章
export function getEarnedBadges(
  seeds: WeeklySeed[],
  contacts: GalaxyNode[],
  achievements: Achievement[],
  kindness: KindnessRecord[],
  wisdom: WisdomBankItem[]
): BadgeConfig[] {
  return BADGES.filter((badge) => badge.check(seeds, contacts, achievements, kindness, wisdom));
}

// 获取总徽章数
export function getTotalBadgeCount(): number {
  return BADGES.length;
}
