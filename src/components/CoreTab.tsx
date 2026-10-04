import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Flower,
  Compass,
  Briefcase,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
} from "lucide-react";
import {
  WeeklySeed,
  SeedStatus,
  TrajectoryNode,
  Achievement,
  GalaxyNode,
} from "../types";
import { seedsReducer } from "../reducers";
import { ZenCard, ZenButton, ZenBadge, SectionHeader, ZenInput, ZenTextarea } from "./ui";
import { SeedCard } from "./cards";
import SkillInvestmentMap from "./SkillInvestmentMap";
import TrajectoryTimeline from "./TrajectoryTimeline";
import { LevelBadgeSystem } from "./LevelBadgeSystem";
import { QuarterlyCompass } from "./QuarterlyCompass";
import { AICoach } from "./AICoach";

interface CoreTabProps {
  seeds: WeeklySeed[];
  setSeeds: React.Dispatch<React.SetStateAction<WeeklySeed[]>>;
  trajectoryNodes: TrajectoryNode[];
  onAddTrajectoryNode: (node: Omit<TrajectoryNode, "id">) => void;
  contacts: GalaxyNode[];
  achievements: Achievement[];
  kindnessRipples: any[];
  wisdomItems: any[];
  totalScore: number;
}

export function CoreTab({
  seeds,
  setSeeds,
  trajectoryNodes,
  onAddTrajectoryNode,
  contacts,
  achievements,
  kindnessRipples,
  wisdomItems,
  totalScore,
}: CoreTabProps) {
  const [newSeedTitle, setNewSeedTitle] = useState("");
  const [newSeedCategory, setNewSeedCategory] = useState<
    "智慧" | "创造" | "连结" | "心性" | "体魄"
  >("智慧");
  const [newSeedDeadline, setNewSeedDeadline] = useState("");
  const [newSeedExpectedGrowth, setNewSeedExpectedGrowth] = useState("");
  const [newSeedDescription, setNewSeedDescription] = useState("");
  const [showSmartFields, setShowSmartFields] = useState(false);
  const [journalText, setJournalText] = useState(
    "本周前半周都在闭关攻克粒子重力吸引算法。和张教授深入长谈了一次，探讨了‘连结’在网络星系中的引力机制，豁然开朗。后半周我指导了后浪陈小新完成了分布式云服务的打通，看到他顺利上线的那一刻，感觉自己也荡漾出了一丝满足的波浪。下周想继续打磨 Momentum 的视觉禅细节。"
  );
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachStatusMessage, setCoachStatusMessage] = useState("");


  const totalMomentum = useMemo(
    () => seeds.reduce((acc, s) => acc + s.momentumScore, 0),
    [seeds]
  );

  const seedStats = useMemo(() => {
    const statusCount = { 萌芽: 0, 生长: 0, 绽放: 0 };
    const categoryCount: Record<string, number> = {};
    seeds.forEach((s) => {
      statusCount[s.status] = (statusCount[s.status] || 0) + 1;
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });
    return { statusCount, categoryCount };
  }, [seeds]);

  const dispatchSeed = useCallback(
    (action: Parameters<typeof seedsReducer>[1]) => {
      setSeeds((prev) => seedsReducer(prev, action));
    },
    [setSeeds]
  );

  const handleSproutSeed = useCallback(
    (id: string) => {
      dispatchSeed({ type: "ADVANCE_SEED", payload: { id } });
    },
    [dispatchSeed]
  );

  const handleAddSeed = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSeedTitle.trim()) return;
      dispatchSeed({
        type: "ADD_SEED",
        payload: {
          title: newSeedTitle,
          category: newSeedCategory,
          deadline: newSeedDeadline || undefined,
          expectedGrowth: newSeedExpectedGrowth ? Number(newSeedExpectedGrowth) : undefined,
          description: newSeedDescription || undefined,
        },
      });
      setNewSeedTitle("");
      setNewSeedDeadline("");
      setNewSeedExpectedGrowth("");
      setNewSeedDescription("");
      setShowSmartFields(false);
    },
    [dispatchSeed, newSeedTitle, newSeedCategory, newSeedDeadline, newSeedExpectedGrowth, newSeedDescription]
  );

  const handleUpdateProgress = useCallback(
    (id: string, progress: number) => {
      dispatchSeed({ type: "UPDATE_PROGRESS", payload: { id, progress } });
    },
    [dispatchSeed]
  );

  // AI Coach 本地分析（即使没有 API 也能提供结构化洞察
  const localCoachAnalysis = useMemo(() => {
    // 种子分类统计
    const categoryCount: Record<string, number> = {};
    seeds.forEach((s) => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });

    const totalSeeds = seeds.length;

    // 找出占比最高的类别
    let topCategory = "";
    let topCategoryCount = 0;
    Object.entries(categoryCount).forEach(([cat, count]) => {
      if (count > topCategoryCount) {
        topCategory = cat;
        topCategoryCount = count;
      }
    });

    // 绽放种子数
    const bloomCount = seeds.filter((s) => s.status === "绽放").length;
    const growingCount = seeds.filter((s) => s.status === "生长").length;
    const sproutCount = seeds.filter((s) => s.status === "萌芽").length;

    // 风险检测
    const risks: { type: string; message: string; level: "warning" | "info" }[] = [];

    // 检查是否某个维度完全没有种子
    const allCategories = ["智慧", "创造", "连结", "心性", "体魄"];
    const missingCategories = allCategories.filter((c) => !categoryCount[c]);
    if (missingCategories.length > 0 && totalSeeds > 0) {
      risks.push({
        type: "维度缺失",
        message: `你已有 ${totalSeeds} 颗种子，但缺少 ${missingCategories.join("、")} 维度的成长投入。`,
        level: missingCategories.length >= 3 ? "warning" : "info",
      });
    }

    // 检查是否只有萌芽没有生长
    if (sproutCount > 3 && growingCount === 0 && bloomCount === 0 && totalSeeds > 3) {
      risks.push({
        type: "启动过多",
        message: "你有很多想法在萌芽，但都还没进入生长状态。试试聚焦 2-3 颗种子深耕。",
        level: "warning",
      });
    }

    // 检查连结维度
    if (!categoryCount["连结"] && totalSeeds >= 3) {
      risks.push({
        type: "关系提醒",
        message: "最近在自我成长上投入很多，但别忘了关系也是能量的重要来源。",
        level: "info",
      });
    }

    // 生成成长建议
    const suggestions: string[] = [];

    if (topCategory && topCategoryCount / Math.max(1, totalSeeds) > 0.6) {
      suggestions.push(`你最近在【${topCategory}】维度投入较多，建议适当增加其他维度的种子保持平衡。`);
    }

    if (bloomCount > 0) {
      suggestions.push(`你已有 ${bloomCount} 颗种子绽放了，这些能量可以尝试分享给他人，产生更大的影响力。`);
    }

    if (sproutCount > 2) {
      suggestions.push(`有 ${sproutCount} 颗种子正在萌芽，建议选择最有感觉的 1-2 颗优先滋养，集中能量。`);
    }

    if (suggestions.length === 0) {
      suggestions.push("你的成长分布很均衡，继续保持这个节奏！");
    }

    return {
      categoryCount,
      topCategory,
      topCategoryCount,
      bloomCount,
      growingCount,
      sproutCount,
      totalSeeds,
      risks,
      suggestions,
    };
  }, [seeds]);

  const handleConsultCoach = async () => {
    setIsCoaching(true);
    setCoachStatusMessage("正在溯源生命脉络...");

    setTimeout(() => {
      setCoachStatusMessage("正在凝聚成长能量...");
    }, 1200);

    setTimeout(() => {
      setCoachStatusMessage("正在发现你本周的生命回响...");
    }, 2400);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeklySeeds: seeds,
          journalText,
          achievements: [] as Achievement[],
          contacts: [] as GalaxyNode[],
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiFeedback(data.text);
      } else {
        setAiFeedback(data.fallback);
      }
    } catch (err) {
      console.error(err);
      setAiFeedback(`【生命律动】
在本周的律动中，你默默呵护着 ${seeds.length} 颗生长种子。其中，有 ${seeds.filter((s) => s.status === "绽放").length} 颗种子迎来了绽放时刻。那些在清晨与静夜里付出的时间，不是生命的损耗，而是能量的层层积累。

【星系回响】
在你的脉络星系中，引力的波纹正缓缓荡开。每一个成就资产的垒起，都是你对这个世界产生的独一无二的回响。

【成长启迪】
生命短短，不看余晖，看星光。下周，让能量继续轻盈流淌，静待下一处生长点的萌芽。`);
    } finally {
      setIsCoaching(false);
    }
  };

  return (
    <motion.div
      key="tab-core"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Intro summary */}
      <div className="bg-slate-900/30 p-4 border border-slate-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-medium text-slate-200 text-sm">
            内圆：自我律动系统 (Self-Growth Core)
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            这里是你力量的源起。每周种下成长种子、记录技能积累、追踪季度方向、观察年度曲线，帮你把每一次努力都叠加上升。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-400">
            蓄能种子:{" "}
            <strong className="text-amber-400 font-mono font-bold">
              {seeds.length} 颗
            </strong>
          </span>
          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-400">
            总生长能:{" "}
            <strong className="text-amber-400 font-mono font-bold">
              {totalMomentum} G
            </strong>
          </span>
        </div>
      </div>

      {/* Subgrid: Weekly seeds and Weekend Harvest AI Observer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Weekly seeds Sprouter */}
        <ZenCard className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <SectionHeader
              icon={<Flower size={16} />}
              title="周·种子 (Weekly Seeds)"
              subtitle="点击种子进行“滋养绽放”"
            />

            {/* Add Seed Mini Form */}
            <form
              id="seed-input-area"
              onSubmit={handleAddSeed}
              className="flex flex-col gap-2 mb-4 text-xs"
            >
              <div className="flex gap-2">
                <ZenInput
                  type="text"
                  required
                  value={newSeedTitle}
                  onChange={(e) => setNewSeedTitle(e.target.value)}
                  placeholder="种下一颗本周成长目标..."
                  className="flex-1"
                />
                <select
                  value={newSeedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setNewSeedCategory(e.target.value as any)
                  }
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-200 focus:outline-none text-center"
                >
                  <option value="智慧">智慧</option>
                  <option value="创造">创造</option>
                  <option value="连结">连结</option>
                  <option value="心性">心性</option>
                  <option value="体魄">体魄</option>
                </select>
                <ZenButton type="submit" size="md">
                  种下
                </ZenButton>
              </div>

              {/* SMART 字段切换 */}
              <button
                type="button"
                onClick={() => setShowSmartFields(!showSmartFields)}
                className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 self-start"
              >
                <Target size={10} />
                <span>{showSmartFields ? "收起 SMART 设置" : "添加 SMART 目标设置"}</span>
              </button>

              {/* SMART 字段 */}
              <AnimatePresence>
                {showSmartFields && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            目标期限
                          </label>
                          <input
                            type="date"
                            value={newSeedDeadline}
                            onChange={(e) => setNewSeedDeadline(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 text-[11px] focus:outline-none focus:border-amber-400/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">
                            预期成长 (G)
                          </label>
                          <ZenInput
                            type="number"
                            value={newSeedExpectedGrowth}
                            onChange={(e) => setNewSeedExpectedGrowth(e.target.value)}
                            placeholder="如: 20"
                            className="py-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">
                          目标描述
                        </label>
                        <ZenTextarea
                          rows={2}
                          value={newSeedDescription}
                          onChange={(e) => setNewSeedDescription(e.target.value)}
                          placeholder="具体描述这个种子的目标是什么..."
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Seed list */}
            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {seeds.map((seed) => (
                <SeedCard
                  key={seed.id}
                  seed={seed}
                  onSprout={handleSproutSeed}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 mt-4 leading-relaxed">
            * 状态流转律：萌芽 ➔ 生长 ➔ 绽放。每次升级都会为对应维度的生长能叠加上升势能。
          </div>
        </ZenCard>

        {/* Right Column: Weekend Harvest AI coach observer */}
        <ZenCard className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <SectionHeader
              icon={<Sparkles size={16} />}
              title="周·萃取 (Weekend Harvest)"
              subtitle="由 Momentum AI Coach 静默指引"
            />

            {/* Diary Input */}
            <div id="journal-area" className="text-xs">
              <label className="block text-slate-500 mb-1.5">
                记录本周高光瞬间与微小影响（想法或日记）：
              </label>
              <ZenTextarea
                rows={3}
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="这一周我做了什么，有什么让我觉得生命在产生微光？..."
              />
            </div>

            {/* Request AI Button */}
            <ZenButton
              onClick={handleConsultCoach}
              disabled={isCoaching}
              className="mt-3 w-full"
              icon={!isCoaching ? <Sparkles size={13} className="animate-pulse" /> : undefined}
              loading={isCoaching}
            >
              {isCoaching ? coachStatusMessage : "Momentum Coach 观察并萃取"}
            </ZenButton>

            {/* AI Response Block */}
            {(aiFeedback || isCoaching) && (
              <div className="mt-4 p-4 rounded-xl bg-amber-400/5 border border-amber-400/20 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[8px] tracking-wider text-amber-400/40 uppercase font-mono">
                  AI Observation
                </div>

                {isCoaching ? (
                  <div className="space-y-2">
                    <div className="h-3.5 bg-slate-800 rounded animate-pulse w-3/4" />
                    <div className="h-3.5 bg-slate-800 rounded animate-pulse w-5/6" />
                    <div className="h-3.5 bg-slate-800 rounded animate-pulse w-2/3" />
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {aiFeedback}
                  </div>
                )}
              </div>
            )}

            {/* 本地成长洞察（即使没有 AI API 也能显示 */}
            <div className="mt-4 space-y-3">
              {/* 成长主题 */}
              {localCoachAnalysis.topCategory && (
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-amber-400/10 flex items-center justify-center">
                      <Sparkles size={10} className="text-amber-400" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">本周成长主题</span>
                  </div>
                  <div className="text-sm font-medium text-amber-300">
                    {localCoachAnalysis.topCategory}
                    <span className="text-[10px] text-slate-500 ml-2">
                      占比 {Math.round((localCoachAnalysis.topCategoryCount / Math.max(1, localCoachAnalysis.totalSeeds)) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* 风险预警 */}
              {localCoachAnalysis.risks.length > 0 && (
                <div
                  className="p-3 rounded-xl border"
                  style={{
                    backgroundColor: localCoachAnalysis.risks.some((r) => r.level === "warning")
                      ? "rgba(251, 146, 60, 0.05)"
                      : "rgba(56, 189, 248, 0.05)",
                    borderColor: localCoachAnalysis.risks.some((r) => r.level === "warning")
                      ? "rgba(251, 146, 60, 0.2)"
                      : "rgba(56, 189, 248, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-orange-400/10 flex items-center justify-center">
                      <AlertTriangle size={10} className="text-orange-400" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">成长洞察</span>
                  </div>
                  <div className="space-y-2">
                    {localCoachAnalysis.risks.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[10px]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            risk.level === "warning" ? "bg-orange-400" : "bg-sky-400"
                          }`}
                        />
                        <span className="text-slate-400">{risk.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 成长建议 */}
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/10 flex items-center justify-center">
                    <Lightbulb size={10} className="text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300">成长建议</span>
                </div>
                <div className="space-y-1.5">
                  {localCoachAnalysis.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[10px]">
                      <span className="text-emerald-400 font-mono">{idx + 1}.</span>
                      <span className="text-slate-400 leading-relaxed">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 mt-4 italic">
            “AI观察员的角色不是督促，而是帮助你在平淡生活的缝隙里发现能量的积累。”
          </div>
        </ZenCard>
      </div>

      {/* AI 成长教练 - 洞察、预测、追踪 */}
      <AICoach
        seeds={seeds}
        contacts={contacts}
        trajectoryNodes={trajectoryNodes}
      />

      {/* 成长等级与徽章系统 */}
      <LevelBadgeSystem
        seeds={seeds}
        contacts={contacts}
        achievements={achievements}
        kindness={kindnessRipples}
        wisdom={wisdomItems}
        totalScore={totalScore}
      />

      {/* Subgrid: Monthly Milestones 技能投资图 */}
      <SkillInvestmentMap seeds={seeds} contacts={contacts} />

      {/* Subgrid: Quarterly Compass (季·罗盘) */}
      <QuarterlyCompass />

      {/* Subgrid: Annual trajectory (年·轨迹) */}
      <TrajectoryTimeline
        nodes={trajectoryNodes}
        onAddNode={onAddTrajectoryNode}
      />
    </motion.div>
  );
}
