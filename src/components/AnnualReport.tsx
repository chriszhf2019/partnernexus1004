import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  TrendingUp,
  Users,
  Heart,
  BookOpen,
  Target,
  Sparkles,
  Share2,
  Download,
  X,
  Calendar,
  Star,
  Zap,
} from "lucide-react";
import { ZenCard, ZenButton } from "./ui";
import { WeeklySeed, GalaxyNode, Achievement, KindnessRecord, WisdomBankItem } from "../types";
import { GrowthScoreBreakdown } from "../utils/growthScore";
import { getCurrentLevel, getEarnedBadges } from "../utils/levelSystem";

interface AnnualReportProps {
  isOpen: boolean;
  onClose: () => void;
  seeds: WeeklySeed[];
  contacts: GalaxyNode[];
  achievements: Achievement[];
  kindnessRipples: KindnessRecord[];
  wisdomItems: WisdomBankItem[];
  scoreBreakdown: GrowthScoreBreakdown;
  year?: number;
}

export function AnnualReport({
  isOpen,
  onClose,
  seeds,
  contacts,
  achievements,
  kindnessRipples,
  wisdomItems,
  scoreBreakdown,
  year = new Date().getFullYear(),
}: AnnualReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentLevel = useMemo(() => getCurrentLevel(scoreBreakdown.totalScore), [scoreBreakdown.totalScore]);
  const earnedBadges = useMemo(
    () => getEarnedBadges(seeds, contacts, achievements, kindnessRipples, wisdomItems),
    [seeds, contacts, achievements, kindnessRipples, wisdomItems]
  );

  const stats = useMemo(() => {
    const bloomedSeeds = seeds.filter((s) => s.status === "绽放").length;
    const growingSeeds = seeds.filter((s) => s.status === "生长").length;
    const totalInteractions = contacts.reduce((sum, c) => sum + c.sharedRipplesCount, 0);
    const topCategory = seeds.reduce((acc, seed) => {
      acc[seed.category] = (acc[seed.category] || 0) + seed.momentumScore;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedCategories = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);
    const topCategoryName = sortedCategories[0]?.[0] || "成长";
    
    return {
      totalSeeds: seeds.length,
      bloomedSeeds,
      growingSeeds,
      totalContacts: contacts.length,
      totalKindness: kindnessRipples.length,
      totalWisdom: wisdomItems.length,
      totalAchievements: achievements.length,
      totalInteractions,
      topCategory: topCategoryName,
      topCategoryScore: sortedCategories[0]?.[1] || 0,
    };
  }, [seeds, contacts, achievements, kindnessRipples, wisdomItems]);

  const keywords = useMemo(() => {
    const words: string[] = [];
    if (stats.bloomedSeeds > 0) words.push("绽放");
    if (stats.growingSeeds > 2) words.push("专注");
    if (stats.totalContacts > 5) words.push("连接");
    if (stats.totalKindness > 3) words.push("善意");
    if (stats.totalWisdom > 5) words.push("智慧");
    if (scoreBreakdown.totalScore > 200) words.push("成长");
    if (earnedBadges.length > 3) words.push("成就");
    if (stats.topCategory === "创造") words.push("创造");
    if (stats.topCategory === "智慧") words.push("学习");
    if (stats.topCategory === "连结") words.push("关系");
    return words.slice(0, 5);
  }, [stats, scoreBreakdown.totalScore, earnedBadges.length]);

  const handleShare = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("分享图片已生成！在实际产品中会保存到相册或分享到社交平台。");
    }, 1500);
  };

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("年度报告已保存！在实际产品中会下载为图片。");
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg"
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
            >
              <X size={16} />
            </button>

            {/* 报告卡片 */}
            <div
              ref={reportRef}
              className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* 头部 - 英雄区域 */}
              <div className="relative p-6 pb-8 bg-gradient-to-br from-amber-950/40 via-slate-900 to-purple-950/30">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={14} className="text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">{year} 年度成长报告</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-100 mb-1">我的生命成长</h2>
                  <p className="text-sm text-slate-400">不看余晖 · 只看星光</p>

                  {/* 核心数据 */}
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                      <div className="text-left">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">成长能</p>
                        <p className="text-3xl font-bold font-mono text-amber-400">
                          +{scoreBreakdown.totalScore}
                        </p>
                      </div>
                      <div className="w-px h-10 bg-slate-700" />
                      <div className="text-left">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">等级</p>
                        <p className="text-xl font-bold text-slate-200">
                          {currentLevel.icon} {currentLevel.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 成长关键词 */}
              <div className="px-6 py-4 border-b border-slate-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-xs font-medium text-slate-300">年度关键词</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, idx) => (
                    <motion.span
                      key={keyword}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/30 text-amber-300"
                    >
                      {keyword}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* 三维度数据 */}
              <div className="px-6 py-5 space-y-4">
                {/* 自我成长 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                    <Target size={18} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">自我成长</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">{scoreBreakdown.coreScore} G</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span>🌱 {stats.totalSeeds} 颗种子</span>
                      <span>🌸 {stats.bloomedSeeds} 朵绽放</span>
                      <span>⭐ {stats.totalAchievements} 项成就</span>
                    </div>
                  </div>
                </div>

                {/* 关系网络 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">关系网络</span>
                      <span className="text-sm font-bold text-blue-400 font-mono">{scoreBreakdown.galaxyScore} G</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span>👥 {stats.totalContacts} 位伙伴</span>
                      <span>💫 {stats.totalInteractions} 次共鸣</span>
                    </div>
                  </div>
                </div>

                {/* 世界影响 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center flex-shrink-0">
                    <Heart size={18} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">世界影响</span>
                      <span className="text-sm font-bold text-purple-400 font-mono">{scoreBreakdown.rippleScore} G</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span>💝 {stats.totalKindness} 次善意</span>
                      <span>📚 {stats.totalWisdom} 条智慧</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 成就徽章 */}
              <div className="px-6 py-4 border-t border-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-amber-400" />
                    <span className="text-xs font-medium text-slate-300">年度成就</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{earnedBadges.length} 枚徽章</span>
                </div>
                <div className="flex justify-center gap-3">
                  {earnedBadges.slice(0, 5).map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 text-center w-14 truncate">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                  {earnedBadges.length === 0 && (
                    <p className="text-xs text-slate-500 italic">
                      继续成长，解锁更多成就徽章
                    </p>
                  )}
                </div>
              </div>

              {/* 金句 */}
              <div className="px-6 py-5 border-t border-slate-800/50 text-center">
                <p className="text-sm text-slate-400 italic leading-relaxed">
                  "向下深扎自我的根系，<br />向外漫流善良的涟漪。"
                </p>
              </div>

              {/* 底部品牌 */}
              <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800/50">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to top right, var(--theme-primary), var(--theme-primary-dark))`,
                    }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: "var(--theme-fg)" }}>念</span>
                  </div>
                  <span className="text-xs text-slate-500">Momentum · 数字禅人生增值系统</span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-4">
              <ZenButton
                onClick={handleShare}
                className="flex-1 py-3"
                icon={<Share2 size={16} />}
                loading={isGenerating}
              >
                分享报告
              </ZenButton>
              <ZenButton
                onClick={handleDownload}
                className="flex-1 py-3"
                variant="secondary"
                icon={<Download size={16} />}
                loading={isGenerating}
              >
                保存图片
              </ZenButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
