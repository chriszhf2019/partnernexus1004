import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, ChevronDown, ChevronUp, BookOpen, Dumbbell, Brain, Heart, Users, Globe, Zap } from "lucide-react";
import { ZenCard } from "./ui";
import { GrowthScoreBreakdown, ScoreFormula } from "../utils/growthScore";

interface GrowthScorePanelProps {
  breakdown: GrowthScoreBreakdown;
}

interface ScoreCategory {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

// 维度配置
const SELF_CATEGORIES: Record<string, ScoreCategory> = {
  智慧: { name: "智慧学习", icon: BookOpen, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  体魄: { name: "体魄运动", icon: Dumbbell, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  心性: { name: "心性冥想", icon: Brain, color: "text-purple-400", bgColor: "bg-purple-400/10" },
  连结: { name: "关系连结", icon: Heart, color: "text-pink-400", bgColor: "bg-pink-400/10" },
  创造: { name: "创造产出", icon: Zap, color: "text-amber-400", bgColor: "bg-amber-400/10" },
};

const NETWORK_CATEGORIES: Record<string, ScoreCategory> = {
  智囊: { name: "智囊导师", icon: Brain, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  战友: { name: "并肩战友", icon: Users, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  灵感: { name: "灵感源泉", icon: Zap, color: "text-amber-400", bgColor: "bg-amber-400/10" },
  后浪: { name: "培养后浪", icon: Heart, color: "text-pink-400", bgColor: "bg-pink-400/10" },
};

const IMPACT_CATEGORIES: Record<string, ScoreCategory> = {
  善举: { name: "善意善举", icon: Heart, color: "text-rose-400", bgColor: "bg-rose-400/10" },
  智慧: { name: "智慧分享", icon: BookOpen, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  成就: { name: "成就里程碑", icon: TrendingUp, color: "text-amber-400", bgColor: "bg-amber-400/10" },
};

function getCategoryConfig(category: string, type: "self" | "network" | "impact"): ScoreCategory {
  if (type === "self") return SELF_CATEGORIES[category] || { name: category, icon: Zap, color: "text-amber-400", bgColor: "bg-amber-400/10" };
  if (type === "network") return NETWORK_CATEGORIES[category] || { name: category, icon: Users, color: "text-blue-400", bgColor: "bg-blue-400/10" };
  return IMPACT_CATEGORIES[category] || { name: category, icon: Globe, color: "text-purple-400", bgColor: "bg-purple-400/10" };
}

function ScoreSection({
  title,
  score,
  maxScore,
  color,
  formulas,
  type,
}: {
  title: string;
  score: number;
  maxScore: number;
  color: string;
  formulas: ScoreFormula[];
  type: "self" | "network" | "impact";
}) {
  const [expanded, setExpanded] = useState(false);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      {/* 头部 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-950/30 hover:bg-slate-950/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center bg-current/10`}>
            <span className="text-sm">{title === "自我成长" ? "🌱" : title === "关系网络" ? "🌐" : "🌊"}</span>
          </div>
          <span className="text-sm font-medium text-slate-200">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-lg font-bold font-mono" style={{ color: color.includes("amber") ? "#fbbf24" : color.includes("blue") ? "#60a5fa" : "#a78bfa" }}>
              {score}
            </span>
            <span className="text-xs text-slate-500"> G</span>
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-slate-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-500" />
          )}
        </div>
      </button>

      {/* 进度条 */}
      <div className="h-1 bg-slate-900">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full"
          style={{
            backgroundColor: color.includes("amber") ? "#fbbf24" : color.includes("blue") ? "#60a5fa" : "#a78bfa",
          }}
        />
      </div>

      {/* 展开内容 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2 bg-slate-950/20">
              {formulas.length > 0 ? (
                formulas.map((formula) => {
                  const config = getCategoryConfig(formula.name, type);
                  return (
                    <div key={formula.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded ${config.bgColor} flex items-center justify-center`}>
                          <config.icon size={10} className={config.color} />
                        </div>
                        <span className="text-xs text-slate-400">{config.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          {formula.items.map((item, idx) => (
                            <span key={idx}>
                              {item.label}×{item.count}
                              {idx < formula.items.length - 1 && <span className="mx-1">·</span>}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-mono font-medium" style={{ color: color.includes("amber") ? "#fbbf24" : color.includes("blue") ? "#60a5fa" : "#a78bfa" }}>
                          +{formula.value}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 italic text-center py-2">
                  暂无数据，开始你的成长之旅吧
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GrowthScorePanel({ breakdown }: GrowthScorePanelProps) {
  // 按类型分组公式
  const selfFormulas = breakdown.formulas.filter((f) =>
    ["智慧", "体魄", "心性", "连结", "创造"].includes(f.name)
  );
  const networkFormulas = breakdown.formulas.filter((f) =>
    ["智囊", "战友", "灵感", "后浪"].includes(f.name)
  );
  const impactFormulas = breakdown.formulas.filter((f) =>
    ["善举", "智慧", "成就"].includes(f.name)
  );

  return (
    <ZenCard accent="top" className="bg-gradient-to-b from-slate-900/80 to-slate-900/40">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
          <TrendingUp size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-200">成长积分引擎</h3>
          <p className="text-[10px] text-slate-500">G = Self + Network + Impact</p>
        </div>
      </div>

      {/* 三维度评分 */}
      <div className="space-y-2">
        <ScoreSection
          title="自我成长"
          score={breakdown.coreScore}
          maxScore={Math.max(breakdown.coreScore, 100)}
          color="amber"
          formulas={selfFormulas}
          type="self"
        />
        <ScoreSection
          title="关系网络"
          score={breakdown.galaxyScore}
          maxScore={Math.max(breakdown.galaxyScore, 100)}
          color="blue"
          formulas={networkFormulas}
          type="network"
        />
        <ScoreSection
          title="世界影响"
          score={breakdown.rippleScore}
          maxScore={Math.max(breakdown.rippleScore, 100)}
          color="purple"
          formulas={impactFormulas}
          type="impact"
        />
      </div>

      {/* 总积分 */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="text-sm text-slate-300">成长总值</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono" style={{ color: "var(--theme-primary)" }}>
              {breakdown.totalScore}
            </span>
            <span className="text-sm text-slate-500">G</span>
          </div>
        </div>
      </div>

      {/* 提示 */}
      <div className="mt-3 text-[10px] text-slate-500 italic text-center">
        积分仅作激励参考，真正的成长无法用数字衡量
      </div>
    </ZenCard>
  );
}
