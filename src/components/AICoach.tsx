import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, TrendingUp, Target, AlertTriangle, CheckCircle, Clock, ChevronRight, Sparkles, Lightbulb } from "lucide-react";
import { ZenCard, SectionHeader } from "./ui";
import { WeeklySeed, GalaxyNode, TrajectoryNode } from "../types";

interface AICoachProps {
  seeds: WeeklySeed[];
  contacts: GalaxyNode[];
  trajectoryNodes: TrajectoryNode[];
}

interface CoachInsight {
  id: string;
  type: "prediction" | "suggestion" | "risk" | "progress";
  title: string;
  description: string;
  action?: string;
  priority: "high" | "medium" | "low";
  tracked: boolean;
}

interface GrowthTrend {
  dimension: string;
  trend: "rising" | "stable" | "declining";
  prediction: string;
  confidence: number;
}

export function AICoach({ seeds, contacts, trajectoryNodes }: AICoachProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "trends" | "history">("insights");
  const [insights, setInsights] = useState<CoachInsight[]>([]);

  // 计算维度分布
  const dimensionStats = useMemo(() => {
    const stats: Record<string, { total: number; bloom: number; growing: number; sprout: number }> = {};
    seeds.forEach((seed) => {
      if (!stats[seed.category]) {
        stats[seed.category] = { total: 0, bloom: 0, growing: 0, sprout: 0 };
      }
      stats[seed.category].total++;
      if (seed.status === "绽放") stats[seed.category].bloom++;
      else if (seed.status === "生长") stats[seed.category].growing++;
      else stats[seed.category].sprout++;
    });
    return stats;
  }, [seeds]);

  // 生成预测分析
  const growthTrends = useMemo((): GrowthTrend[] => {
    const trends: GrowthTrend[] = [];
    const dimensions = ["智慧", "创造", "连结", "心性", "体魄"];

    dimensions.forEach((dim) => {
      const stat = dimensionStats[dim];
      const total = stat?.total || 0;
      const bloomRate = total > 0 ? (stat?.bloom || 0) / total : 0;

      let trend: GrowthTrend["trend"] = "stable";
      let prediction = "";

      if (total === 0) {
        trend = "declining";
        prediction = "这个维度还没有种子，建议考虑种下一颗";
      } else if (bloomRate >= 0.5) {
        trend = "rising";
        prediction = "这个维度发展良好，绽放率超过50%";
      } else if (stat?.growing && stat.growing >= 2) {
        trend = "rising";
        prediction = "多颗种子正在生长中，预计近期会有绽放";
      } else if (stat?.sprout && stat.sprout >= 3) {
        trend = "stable";
        prediction = "种子数量较多，建议聚焦深耕而非扩张";
      } else {
        trend = "stable";
        prediction = "发展平稳，继续保持当前节奏";
      }

      trends.push({
        dimension: dim,
        trend,
        prediction,
        confidence: total > 0 ? Math.min(95, 50 + total * 10) : 30,
      });
    });

    return trends;
  }, [dimensionStats]);

  // 生成洞察
  const generatedInsights = useMemo((): CoachInsight[] => {
    const insights: CoachInsight[] = [];
    const totalSeeds = seeds.length;
    const totalContacts = contacts.length;

    // 风险洞察
    const allCategories = ["智慧", "创造", "连结", "心性", "体魄"];
    const presentCategories = Object.keys(dimensionStats);
    const missingCategories = allCategories.filter((c) => !presentCategories.includes(c));

    if (missingCategories.length > 0 && totalSeeds > 0) {
      insights.push({
        id: "missing-dimensions",
        type: "risk",
        title: "维度发展不均衡",
        description: `你的种子集中在 ${presentCategories.join("、")} 维度，但缺少 ${missingCategories.join("、")} 维度的投入。`,
        action: `建议在 ${missingCategories[0]} 维度种下一颗种子`,
        priority: missingCategories.length >= 3 ? "high" : "medium",
        tracked: false,
      });
    }

    // 聚焦洞察
    const sproutCount = seeds.filter((s) => s.status === "萌芽").length;
    const growingCount = seeds.filter((s) => s.status === "生长").length;
    const bloomCount = seeds.filter((s) => s.status === "绽放").length;

    if (sproutCount > 5 && growingCount === 0) {
      insights.push({
        id: "too-many-sprouts",
        type: "risk",
        title: "种子过载风险",
        description: `你有 ${sproutCount} 颗种子在萌芽状态，但没有在生长的。能量分散可能导致都没有足够养分。`,
        action: "选择 2-3 颗最有感觉的种子重点滋养",
        priority: "high",
        tracked: false,
      });
    }

    // 关系洞察
    if (totalContacts === 0 && totalSeeds >= 5) {
      insights.push({
        id: "no-contacts",
        type: "suggestion",
        title: "人脉星系为空",
        description: "你已经种下了很多成长种子，但还没有建立人脉连结。关系是能量传递的重要渠道。",
        action: "在「人脉星系」中添加一位对你重要的联系人",
        priority: "medium",
        tracked: false,
      });
    }

    // 关系健康度
    const unhealthyContacts = contacts.filter((c) => {
      const days = Math.floor((Date.now() - new Date(c.lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24));
      const threshold = c.resonanceFrequency === "周" ? 7 : c.resonanceFrequency === "月" ? 30 : 90;
      return days > threshold * 2;
    });

    if (unhealthyContacts.length > 0) {
      insights.push({
        id: "unhealthy-relationships",
        type: "risk",
        title: "关系需要滋养",
        description: `${unhealthyContacts.length} 位联系人已经超过共振频率的 2 倍时间未互动。`,
        action: `去「人脉星系」与 ${unhealthyContacts[0].name} 重新建立连结`,
        priority: "medium",
        tracked: false,
      });
    }

    // 成长预测
    if (bloomCount >= 3) {
      insights.push({
        id: "momentum-building",
        type: "prediction",
        title: "成长势能正在积累",
        description: `你已有 ${bloomCount} 颗种子绽放，这是很好的成长势能。建议将这些能量分享出去，产生更大的影响。`,
        action: "记录一次「善意涟漪」，或者帮助一位后浪成长",
        priority: "low",
        tracked: false,
      });
    }

    // 轨迹洞察
    const recentTrajectory = trajectoryNodes.slice(0, 3);
    const avgG = recentTrajectory.length > 0
      ? recentTrajectory.reduce((sum, n) => sum + n.heightValue, 0) / recentTrajectory.length
      : 0;

    if (recentTrajectory.length >= 3 && avgG > 50) {
      insights.push({
        id: "trajectory-accelerating",
        type: "prediction",
        title: "成长加速度提升",
        description: `最近 ${recentTrajectory.length} 个里程碑的平均能量达到 ${Math.round(avgG)} G，成长在加速！`,
        priority: "low",
        tracked: false,
      });
    }

    // 平衡建议
    const categories = Object.entries(dimensionStats);
    if (categories.length >= 3) {
      const sorted = categories.sort((a, b) => b[1].total - a[1].total);
      const topCategory = sorted[0];
      const bottomCategory = sorted[sorted.length - 1];

      if (topCategory[1].total > bottomCategory[1].total * 3) {
        insights.push({
          id: "balance-needed",
          type: "suggestion",
          title: "维度需要平衡",
          description: `${topCategory[0]} 维度投入较多（${topCategory[1].total}颗），但 ${bottomCategory[0]} 只有 ${bottomCategory[1].total} 颗。`,
          action: `本周优先关注 ${bottomCategory[0]} 维度`,
          priority: "medium",
          tracked: false,
        });
      }
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [seeds, contacts, dimensionStats, trajectoryNodes]);

  // 追踪洞察
  const trackInsight = (id: string) => {
    setInsights((prev) =>
      prev.map((ins) => (ins.id === id ? { ...ins, tracked: true } : ins))
    );
  };

  // 合并生成的洞察和已追踪的洞察
  const allInsights = useMemo(() => {
    const trackedIds = insights.map((i) => i.id);
    const newInsights = generatedInsights.filter((i) => !trackedIds.includes(i.id));
    return [...newInsights, ...insights];
  }, [generatedInsights, insights]);

  const highPriorityCount = allInsights.filter((i) => i.priority === "high").length;
  const trackedCount = insights.length;

  return (
    <ZenCard className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
      <SectionHeader
        icon={<Brain size={16} />}
        title="AI 成长教练"
        subtitle={`${highPriorityCount} 项高优先级 · ${trackedCount} 项追踪中`}
      />

      {/* Tab 切换 */}
      <div className="flex gap-1 p-1 bg-slate-950/50 rounded-lg mb-4 mt-2">
        {[
          { key: "insights", label: "洞察", icon: Lightbulb },
          { key: "trends", label: "趋势", icon: TrendingUp },
          { key: "history", label: "追踪", icon: Target },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
              activeTab === key
                ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* 洞察列表 */}
      <AnimatePresence mode="wait">
        {activeTab === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {allInsights.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">你的成长状态很健康</p>
                <p className="text-xs mt-1">继续保持当前的节奏</p>
              </div>
            ) : (
              allInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-xl border ${
                    insight.tracked
                      ? "bg-emerald-950/20 border-emerald-500/20"
                      : insight.type === "risk"
                      ? insight.priority === "high"
                        ? "bg-red-950/20 border-red-500/30"
                        : "bg-orange-950/20 border-orange-500/20"
                      : insight.type === "prediction"
                      ? "bg-blue-950/20 border-blue-500/20"
                      : "bg-slate-950/40 border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        insight.tracked
                          ? "bg-emerald-500/20"
                          : insight.type === "risk"
                          ? "bg-red-500/20"
                          : insight.type === "prediction"
                          ? "bg-blue-500/20"
                          : "bg-amber-500/20"
                      }`}
                    >
                      {insight.tracked ? (
                        <CheckCircle size={12} className="text-emerald-400" />
                      ) : insight.type === "risk" ? (
                        <AlertTriangle size={12} className="text-red-400" />
                      ) : insight.type === "prediction" ? (
                        <TrendingUp size={12} className="text-blue-400" />
                      ) : (
                        <Lightbulb size={12} className="text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-slate-200">{insight.title}</h4>
                        {!insight.tracked && (
                          <button
                            onClick={() => trackInsight(insight.id)}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            追踪
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                      {insight.action && !insight.tracked && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-400/80">
                          <ChevronRight size={10} />
                          <span>{insight.action}</span>
                        </div>
                      )}
                      {insight.tracked && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400/80">
                          <CheckCircle size={10} />
                          <span>正在追踪</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* 趋势视图 */}
        {activeTab === "trends" && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="text-xs text-slate-500 mb-3">
              基于 {seeds.length} 颗种子和 {contacts.length} 位联系人分析
            </div>
            {growthTrends.map((trend) => (
              <div
                key={trend.dimension}
                className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                  {trend.dimension === "智慧" && "📚"}
                  {trend.dimension === "创造" && "💡"}
                  {trend.dimension === "连结" && "🤝"}
                  {trend.dimension === "心性" && "🧘"}
                  {trend.dimension === "体魄" && "💪"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">{trend.dimension}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        trend.trend === "rising"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : trend.trend === "declining"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      {trend.trend === "rising" ? "上升 ↑" : trend.trend === "declining" ? "下降 ↓" : "平稳 →"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{trend.prediction}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={9} className="text-slate-600" />
                    <span className="text-[9px] text-slate-600">
                      置信度 {trend.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* 追踪历史 */}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {trackedCount === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Target size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">还没有追踪项</p>
                <p className="text-xs mt-1">在洞察中点击「追踪」开始记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 mb-3">
                  已追踪 {trackedCount} 项成长行动
                </div>
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="flex items-center gap-3 p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle size={12} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-200">{insight.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{insight.action}</p>
                    </div>
                    <button
                      onClick={() => setInsights((prev) => prev.filter((i) => i.id !== insight.id))}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ZenCard>
  );
}
