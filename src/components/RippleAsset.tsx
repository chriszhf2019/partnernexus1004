import React, { useMemo } from "react";
import { motion } from "motion/react";
import {
  Heart,
  BookOpen,
  Briefcase,
  Users,
  TrendingUp,
  Globe,
  Sparkles,
  Award,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Achievement, KindnessRecord, WisdomBankItem, GalaxyNode } from "../types";
import { ZenCard } from "./ui";

interface RippleAssetProps {
  achievements: Achievement[];
  kindnessRipples: KindnessRecord[];
  wisdomItems: WisdomBankItem[];
  contacts: GalaxyNode[];
}

interface AssetCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  count: number;
  description: string;
  trend: "up" | "stable" | "down";
}

export function RippleAsset({
  achievements,
  kindnessRipples,
  wisdomItems,
  contacts,
}: RippleAssetProps) {
  const assetCategories = useMemo((): AssetCategory[] => {
    const helpedPeople = new Set(kindnessRipples.map((r) => r.target)).size;
    const totalRippleDepth = kindnessRipples.reduce((sum, r) => sum + r.rippleDepth, 0);
    const knowledgeOutput = wisdomItems.length;
    const projectContributions = achievements.filter(
      (a) => a.category === "贡献" || a.category === "技术"
    ).length;
    const connectionsMade = contacts.filter((c) => c.introducerId !== null).length;

    return [
      {
        id: "kindness",
        name: "帮助他人",
        icon: Heart,
        color: "text-rose-400",
        bgColor: "bg-rose-400/10",
        count: helpedPeople,
        description: `${kindnessRipples.length} 次善举 · ${totalRippleDepth} 层涟漪`,
        trend: helpedPeople > 5 ? "up" : "stable",
      },
      {
        id: "knowledge",
        name: "知识输出",
        icon: BookOpen,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        count: knowledgeOutput,
        description: `${wisdomItems.length} 篇心法 · 持续复利`,
        trend: knowledgeOutput > 3 ? "up" : "stable",
      },
      {
        id: "projects",
        name: "项目贡献",
        icon: Briefcase,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        count: projectContributions,
        description: `${achievements.length} 项成就资产`,
        trend: projectContributions > 2 ? "up" : "stable",
      },
      {
        id: "connections",
        name: "推荐连接",
        icon: Users,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        count: connectionsMade,
        description: `${contacts.length} 位人脉节点`,
        trend: connectionsMade > 3 ? "up" : "stable",
      },
    ];
  }, [achievements, kindnessRipples, wisdomItems, contacts]);

  const totalImpactScore = useMemo(() => {
    const helpedPeople = new Set(kindnessRipples.map((r) => r.target)).size;
    const totalRippleDepth = kindnessRipples.reduce((sum, r) => sum + r.rippleDepth, 0);
    return (
      achievements.length * 10 +
      helpedPeople * 5 +
      totalRippleDepth * 2 +
      wisdomItems.length * 3 +
      contacts.length * 2
    );
  }, [achievements, kindnessRipples, wisdomItems, contacts]);

  const impactLevel = useMemo(() => {
    if (totalImpactScore >= 200) return { name: "影响者", icon: "🌊", level: 4 };
    if (totalImpactScore >= 100) return { name: "传播者", icon: "💫", level: 3 };
    if (totalImpactScore >= 50) return { name: "涟漪者", icon: "✨", level: 2 };
    return { name: "萌芽者", icon: "🌱", level: 1 };
  }, [totalImpactScore]);

  const nextMilestone = useMemo(() => {
    if (totalImpactScore < 50) return { score: 50, label: "涟漪者" };
    if (totalImpactScore < 100) return { score: 100, label: "传播者" };
    if (totalImpactScore < 200) return { score: 200, label: "影响者" };
    return null;
  }, [totalImpactScore]);

  const progressToNext = useMemo(() => {
    if (!nextMilestone) return 100;
    const prevMilestone =
      nextMilestone.score === 50
        ? 0
        : nextMilestone.score === 100
        ? 50
        : 100;
    const range = nextMilestone.score - prevMilestone;
    const current = totalImpactScore - prevMilestone;
    return Math.min(100, Math.round((current / range) * 100));
  }, [totalImpactScore, nextMilestone]);

  return (
    <ZenCard className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/30 flex items-center justify-center">
            <Globe size={18} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-200">影响力资产</h3>
            <p className="text-[10px] text-slate-500">Ripple Asset · 你的世界影响指数</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-purple-400">
              {totalImpactScore}
            </span>
            <span className="text-xs text-slate-500">影响值</span>
          </div>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <span className="text-base">{impactLevel.icon}</span>
            <span className="text-[10px] text-slate-400">{impactLevel.name}</span>
          </div>
        </div>
      </div>

      {/* 等级进度条 */}
      {nextMilestone && (
        <div className="mb-5 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
            <span>距离 {nextMilestone.label}</span>
            <span className="text-purple-400 font-mono">
              {nextMilestone.score - totalImpactScore} 点
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #a78bfa, #c084fc, #e879f9)",
              }}
            />
          </div>
        </div>
      )}

      {/* 四类资产 */}
      <div className="grid grid-cols-2 gap-3">
        {assetCategories.map((category, idx) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                  <Icon size={14} className={category.color} />
                </div>
                {category.trend === "up" && (
                  <div className="flex items-center gap-0.5 text-[9px] text-emerald-400">
                    <TrendingUp size={9} />
                    <span>上升</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-slate-200 mb-0.5">
                {category.count}
              </div>
              <div className="text-xs font-medium text-slate-300 mb-1">
                {category.name}
              </div>
              <div className="text-[9px] text-slate-500 leading-relaxed">
                {category.description}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 影响力公式说明 */}
      <div className="mt-4 p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={11} className="text-purple-400" />
          <span className="text-[10px] font-medium text-purple-300">影响力计算方式</span>
        </div>
        <div className="text-[9px] text-slate-500 leading-relaxed space-y-1">
          <div className="flex items-center gap-2">
            <Award size={9} className="text-amber-400" />
            <span>成就资产 × 10</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={9} className="text-rose-400" />
            <span>帮助的人 × 5 + 涟漪深度 × 2</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={9} className="text-blue-400" />
            <span>智慧分享 × 3</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={9} className="text-emerald-400" />
            <span>人脉节点 × 2</span>
          </div>
        </div>
      </div>

      {/* 底部激励语 */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-slate-500 italic">
          "每一次善意都是投向世界的涟漪，最终会以另一种形式回到你身边。"
        </p>
      </div>
    </ZenCard>
  );
}
