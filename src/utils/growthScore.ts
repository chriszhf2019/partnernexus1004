import { WeeklySeed, GalaxyNode, Achievement, KindnessRecord, WisdomBankItem } from "../types";

export interface ScoreFormula {
  id: string;
  name: string;
  description: string;
  value: number;
  items: { label: string; score: number; count: number }[];
}

export interface GrowthScoreBreakdown {
  totalScore: number;
  coreScore: number;
  galaxyScore: number;
  rippleScore: number;
  formulas: ScoreFormula[];
}

export function calculateGrowthScore(
  seeds: WeeklySeed[],
  contacts: GalaxyNode[],
  achievements: Achievement[],
  kindnessRipples: KindnessRecord[],
  wisdomItems: WisdomBankItem[]
): GrowthScoreBreakdown {
  // 内圆：自我成长分
  const seedBloomCount = seeds.filter((s) => s.status === "绽放").length;
  const seedGrowingCount = seeds.filter((s) => s.status === "生长").length;
  const seedSproutCount = seeds.filter((s) => s.status === "萌芽").length;
  const totalSeedScore = seedBloomCount * 15 + seedGrowingCount * 8 + seedSproutCount * 3;

  const coreFormula: ScoreFormula = {
    id: "core",
    name: "内圆·自我成长",
    description: "基于种子状态和数量计算的成长能量",
    value: totalSeedScore,
    items: [
      { label: "绽放的种子", score: 15, count: seedBloomCount },
      { label: "生长中的种子", score: 8, count: seedGrowingCount },
      { label: "萌芽的种子", score: 3, count: seedSproutCount },
    ],
  };

  // 中圆：人脉星系分
  const typeWeights: Record<string, number> = { "智囊": 1.5, "战友": 1.2, "灵感": 1.0, "后浪": 0.8 };
  const totalContactRipples = contacts.reduce((sum, c) => {
    const weight = typeWeights[c.type] || 1;
    return sum + c.sharedRipplesCount * weight;
  }, 0);
  const galaxyScore = Math.round(totalContactRipples * 5 + contacts.length * 2);

  const galaxyFormula: ScoreFormula = {
    id: "galaxy",
    name: "中圆·人脉星系",
    description: "基于关系深度和互动频率计算的连结能量",
    value: galaxyScore,
    items: [
      { label: "人脉节点", score: 2, count: contacts.length },
      { label: "共鸣互动", score: 5, count: Math.round(totalContactRipples) },
    ],
  };

  // 外圆：世界影响分
  const achievementScore = achievements.length * 10;
  const uniqueTargets = new Set(kindnessRipples.map((r) => r.target)).size;
  const totalRipples = kindnessRipples.reduce((sum, r) => sum + r.rippleDepth, 0);
  const wisdomScore = wisdomItems.length * 3;
  const rippleScore = achievementScore + uniqueTargets * 5 + totalRipples * 2 + wisdomScore;

  const rippleFormula: ScoreFormula = {
    id: "ripple",
    name: "外圆·世界影响",
    description: "基于成就、善意、智慧计算的影响能量",
    value: rippleScore,
    items: [
      { label: "成就资产", score: 10, count: achievements.length },
      { label: "帮助的人", score: 5, count: uniqueTargets },
      { label: "涟漪扩散层", score: 2, count: totalRipples },
      { label: "智慧分享", score: 3, count: wisdomItems.length },
    ],
  };

  const totalScore = totalSeedScore + galaxyScore + rippleScore;

  return {
    totalScore,
    coreScore: totalSeedScore,
    galaxyScore,
    rippleScore,
    formulas: [coreFormula, galaxyFormula, rippleFormula],
  };
}
