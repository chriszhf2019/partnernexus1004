import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Zap,
  Target,
  Users,
  Sparkles,
  ChevronRight,
  Clock,
  Check,
  CheckCircle2,
  Circle,
  Flame,
  BookOpen,
  Dumbbell,
  Heart,
  Brain,
  Lightbulb,
  Award,
} from "lucide-react";
import { ZenCard, ZenButton } from "./ui";
import { WeeklySeed, GalaxyNode, KindnessRecord, WisdomBankItem, Achievement } from "../types";
import { GrowthScoreBreakdown } from "../utils/growthScore";
import { getCurrentLevel, getNextLevel, getLevelProgress, getEarnedBadges } from "../utils/levelSystem";

interface DashboardProps {
  seeds: WeeklySeed[];
  contacts: GalaxyNode[];
  kindnessRipples: KindnessRecord[];
  wisdomItems: WisdomBankItem[];
  achievements: Achievement[];
  scoreBreakdown: GrowthScoreBreakdown;
  onQuickAction: (action: "addSeed" | "addContact" | "checkIn") => void;
  streak: number;
  canCheckIn: boolean;
  onCheckIn: () => void;
  onEarnReward: (value: number, type?: "growth" | "streak" | "achievement", label?: string) => void;
  onOpenAnnualReport?: () => void;
}

interface DailyTask {
  id: string;
  title: string;
  type: "seed" | "contact" | "kindness" | "wisdom" | "custom";
  category?: string;
  reward: number;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export function Dashboard({
  seeds,
  contacts,
  kindnessRipples,
  wisdomItems,
  achievements,
  scoreBreakdown,
  onQuickAction,
  streak,
  canCheckIn,
  onCheckIn,
  onEarnReward,
  onOpenAnnualReport,
}: DashboardProps) {
  const level = getCurrentLevel(scoreBreakdown.totalScore);
  const nextLevel = getNextLevel(scoreBreakdown.totalScore);
  const progressToNext = getLevelProgress(scoreBreakdown.totalScore);

  // 今日任务
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const tasks: DailyTask[] = [];

    // 从种子生成任务
    const sproutSeeds = seeds.filter((s) => s.status === "萌芽");
    const growingSeeds = seeds.filter((s) => s.status === "生长");

    if (sproutSeeds.length > 0) {
      tasks.push({
        id: `seed-${sproutSeeds[0].id}`,
        title: `推进「${sproutSeeds[0].title}」进入生长阶段`,
        type: "seed",
        category: sproutSeeds[0].category,
        reward: 5,
        completed: false,
        priority: "high",
      });
    } else if (growingSeeds.length > 0) {
      tasks.push({
        id: `seed-${growingSeeds[0].id}`,
        title: `为「${growingSeeds[0].title}」添加今日进展`,
        type: "seed",
        category: growingSeeds[0].category,
        reward: 3,
        completed: false,
        priority: "high",
      });
    }

    // 从联系人生成任务
    const dimmingContacts = contacts.filter((c) => {
      const days = Math.floor((Date.now() - new Date(c.lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24));
      const threshold = c.resonanceFrequency === "周" ? 7 : c.resonanceFrequency === "月" ? 30 : 90;
      return days > threshold;
    });

    if (dimmingContacts.length > 0) {
      const contact = dimmingContacts[0];
      const days = Math.floor((Date.now() - new Date(contact.lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24));
      tasks.push({
        id: `contact-${contact.id}`,
        title: `联系 ${contact.name}（${days}天未联系）`,
        type: "contact",
        reward: 8,
        completed: false,
        priority: "medium",
      });
    }

    // 默认任务
    if (tasks.length < 3) {
      tasks.push({
        id: "custom-read",
        title: "阅读 30 分钟",
        type: "custom",
        category: "智慧",
        reward: 3,
        completed: false,
        priority: "low",
      });
    }

    if (tasks.length < 4) {
      tasks.push({
        id: "custom-exercise",
        title: "运动 20 分钟",
        type: "custom",
        category: "体魄",
        reward: 3,
        completed: false,
        priority: "low",
      });
    }

    return tasks;
  });

  // 计算今日完成情况
  const completedCount = dailyTasks.filter((t) => t.completed).length;
  const totalCount = dailyTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const earnedG = dailyTasks.filter((t) => t.completed).reduce((sum, t) => sum + t.reward, 0);

  // 切换任务状态
  const toggleTask = (id: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newCompleted = !t.completed;
          if (newCompleted) {
            onEarnReward(t.reward, "growth", "G");
          }
          return { ...t, completed: newCompleted };
        }
        return t;
      })
    );
  };

  // 获取任务图标
  const getTaskIcon = (type: DailyTask["type"], category?: string) => {
    if (type === "contact") return Users;
    if (type === "kindness") return Heart;
    if (type === "wisdom") return BookOpen;
    if (category === "智慧") return BookOpen;
    if (category === "体魄") return Dumbbell;
    if (category === "心性") return Brain;
    if (category === "连结") return Heart;
    if (category === "创造") return Lightbulb;
    return Target;
  };

  // 近期动态
  const recentActivity = useMemo(() => {
    const activities: { icon: typeof Sparkles; text: string; time: string; type: string }[] = [];

    const recentSeeds = [...seeds]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
    recentSeeds.forEach((seed) => {
      const daysAgo = Math.floor((Date.now() - new Date(seed.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      activities.push({
        icon: Target,
        text: `${seed.status === "绽放" ? "绽放了" : seed.status === "生长" ? "生长中" : "种下了"}「${seed.title}」`,
        time: daysAgo === 0 ? "今天" : `${daysAgo}天前`,
        type: "seed",
      });
    });

    const sortedContacts = [...contacts]
      .sort((a, b) => new Date(b.lastInteractionDate).getTime() - new Date(a.lastInteractionDate).getTime())
      .slice(0, 1);
    sortedContacts.forEach((contact) => {
      const daysAgo = Math.floor((Date.now() - new Date(contact.lastInteractionDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo <= 7) {
        activities.push({
          icon: Users,
          text: `与 ${contact.name} 深度交流`,
          time: daysAgo === 0 ? "今天" : `${daysAgo}天前`,
          type: "contact",
        });
      }
    });

    if (kindnessRipples.length > 0) {
      const recent = kindnessRipples[0];
      const daysAgo = Math.floor((Date.now() - new Date(recent.date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo <= 7) {
        activities.push({
          icon: Heart,
          text: `帮助了 ${recent.target}`,
          time: daysAgo === 0 ? "今天" : `${daysAgo}天前`,
          type: "kindness",
        });
      }
    }

    return activities.slice(0, 4);
  }, [seeds, contacts, kindnessRipples]);

  // 已获得的徽章
  const earnedBadges = useMemo(
    () => getEarnedBadges(seeds, contacts, achievements, kindnessRipples, wisdomItems),
    [seeds, contacts, achievements, kindnessRipples, wisdomItems]
  );

  return (
    <div className="space-y-4">
      {/* 今日任务区 - 放在最顶部 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-5 sm:p-6">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          {/* 顶部：成长能量 + 完成率 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            {/* 左侧：能量和等级 */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-bold cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(to bottom right, var(--theme-primary), var(--theme-primary-dark))`,
                    boxShadow: `0 8px 24px var(--theme-glow)`,
                  }}
                  onClick={() => {}}
                >
                  <span className="text-2xl sm:text-3xl" style={{ color: "var(--theme-fg)" }}>
                    {scoreBreakdown.totalScore}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium" style={{ color: "var(--theme-fg)", opacity: 0.8 }}>
                    G
                  </span>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded-full text-[10px] text-slate-300 whitespace-nowrap">
                  {level.icon} {level.name}
                </div>
              </motion.div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-100">今日成长指数</h2>
                {nextLevel && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    距离 {nextLevel.icon} {nextLevel.name} 还差 {nextLevel.minScore - scoreBreakdown.totalScore} G
                  </p>
                )}
                {/* 连续打卡 */}
                {streak > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30">
                      <Flame size={11} className="text-orange-400" />
                      <span className="text-[10px] text-orange-300 font-medium">连续 {streak} 天</span>
                    </div>
                    {canCheckIn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckIn();
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 hover:bg-orange-500/30 transition-colors font-medium"
                      >
                        打卡
                      </button>
                    )}
                  </div>
                )}
                {streak === 0 && canCheckIn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCheckIn();
                    }}
                    className="flex items-center gap-1 mt-2 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20 transition-colors font-medium"
                  >
                    <Flame size={11} />
                    <span>今日打卡</span>
                  </button>
                )}
              </div>
            </div>

            {/* 右侧：今日完成率 */}
            <div className="w-full sm:w-40">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                <span>今日完成</span>
                <span className="text-amber-400 font-mono">
                  {completedCount}/{totalCount} · {completionRate}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(to right, var(--theme-primary), var(--theme-primary-light))`,
                  }}
                />
              </div>
              {earnedG > 0 && (
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <Flame size={10} />
                  今日已获得 +{earnedG} G
                </div>
              )}
            </div>
          </div>

          {/* 三圆分布 */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-400">自我</span>
              <span className="font-mono font-medium text-amber-400">{scoreBreakdown.coreScore}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-400">关系</span>
              <span className="font-mono font-medium text-blue-400">{scoreBreakdown.galaxyScore}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-slate-400">影响</span>
              <span className="font-mono font-medium text-purple-400">{scoreBreakdown.rippleScore}</span>
            </div>
          </div>

          {/* 今日任务列表 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-400/10 flex items-center justify-center">
                  <Target size={12} className="text-amber-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-200">今日任务</h3>
              </div>
              <span className="text-[10px] text-slate-500">完成获得 G 值奖励</span>
            </div>

            <div className="space-y-2">
              {dailyTasks.map((task, idx) => {
                const Icon = getTaskIcon(task.type, task.category);
                return (
                  <motion.button
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      task.completed
                        ? "bg-emerald-950/20 border-emerald-500/20"
                        : task.priority === "high"
                        ? "bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 勾选框 */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-slate-600 hover:border-amber-400"
                        }`}
                      >
                        {task.completed && <Check size={12} className="text-white" />}
                      </div>

                      {/* 图标 */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          task.completed
                            ? "bg-emerald-400/10"
                            : task.priority === "high"
                            ? "bg-amber-400/10"
                            : "bg-slate-800"
                        }`}
                      >
                        <Icon
                          size={14}
                          className={
                            task.completed
                              ? "text-emerald-400"
                              : task.priority === "high"
                              ? "text-amber-400"
                              : "text-slate-400"
                          }
                        />
                      </div>

                      {/* 任务标题 */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            task.completed
                              ? "text-slate-500 line-through"
                              : "text-slate-200"
                          }`}
                        >
                          {task.title}
                        </p>
                      </div>

                      {/* 奖励 */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            task.completed
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-amber-400/10 text-amber-400"
                          }`}
                        >
                          +{task.reward} G
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-3 gap-2">
        <ZenButton
          onClick={() => onQuickAction("addSeed")}
          className="text-xs py-3 flex flex-col items-center gap-1"
          icon={<Target size={14} />}
        >
          <span>种种子</span>
        </ZenButton>
        <ZenButton
          onClick={() => onQuickAction("addContact")}
          className="text-xs py-3 flex flex-col items-center gap-1"
          icon={<Users size={14} />}
        >
          <span>联系人</span>
        </ZenButton>
        <ZenButton
          onClick={() => onQuickAction("checkIn")}
          className="text-xs py-3 flex flex-col items-center gap-1"
          icon={<TrendingUp size={14} />}
        >
          <span>打卡</span>
        </ZenButton>
      </div>

      {/* 近期动态 */}
      {recentActivity.length > 0 && (
        <ZenCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                <Sparkles size={11} className="text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-200">近期动态</h3>
            </div>
            <span className="text-[10px] text-slate-500">{recentActivity.length} 条</span>
          </div>
          <div className="space-y-2">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2 border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <activity.icon size={12} className="text-slate-500" />
                  <span className="text-slate-300">{activity.text}</span>
                </div>
                <span className="text-slate-500 font-mono flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </ZenCard>
      )}

      {/* 成就徽章概览 */}
      <ZenCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-400/10 flex items-center justify-center">
              <Award size={11} className="text-amber-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-200">成就徽章</h3>
          </div>
          <span className="text-[10px] text-slate-500">
            {earnedBadges.length} 枚已获得
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {earnedBadges.slice(0, 4).map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center p-2 rounded-xl bg-amber-400/5 border border-amber-400/20"
            >
              <span className="text-xl mb-1">{badge.icon}</span>
              <span className="text-[9px] text-slate-400 text-center leading-tight">{badge.name}</span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - earnedBadges.length) }).map((_, i) => (
            <div
              key={`locked-${i}`}
              className="flex flex-col items-center p-2 rounded-xl bg-slate-800/30 border border-slate-800"
            >
              <span className="text-xl mb-1 opacity-30">🔒</span>
              <span className="text-[9px] text-slate-600 text-center leading-tight">待解锁</span>
            </div>
          ))}
        </div>
      </ZenCard>

      {/* 种子进展概览 */}
      <ZenCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-400/10 flex items-center justify-center">
              <Target size={11} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-200">种子进展</h3>
          </div>
          <span className="text-[10px] text-slate-500">{seeds.length} 颗种子</span>
        </div>
        <div className="space-y-2">
          {seeds.slice(0, 3).map((seed) => (
            <div key={seed.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                {seed.status === "绽放" ? "🌸" : seed.status === "生长" ? "🌿" : "🌱"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-300 truncate">{seed.title}</span>
                  <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                    {seed.progress ?? 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${seed.progress ?? 0}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ZenCard>

      {/* 年度报告入口 */}
      {onOpenAnnualReport && (
        <button
          onClick={onOpenAnnualReport}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-purple-950/40 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award size={22} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-200">生成成长年报</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                回顾这一年的成长历程，生成专属年度报告
              </p>
            </div>
            <ChevronRight size={18} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
        </button>
      )}
    </div>
  );
}
