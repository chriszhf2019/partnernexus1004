import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Lock, ChevronRight } from "lucide-react";
import { ZenCard } from "./ui";
import { WeeklySeed, GalaxyNode, Achievement, KindnessRecord, WisdomBankItem } from "../types";
import { BADGES, LEVELS, getCurrentLevel, getNextLevel, getLevelProgress, getEarnedBadges } from "../utils/levelSystem";

interface LevelBadgeSystemProps {
  seeds: WeeklySeed[];
  contacts: GalaxyNode[];
  achievements: Achievement[];
  kindness: KindnessRecord[];
  wisdom: WisdomBankItem[];
  totalScore: number;
}

export function LevelBadgeSystem({
  seeds,
  contacts,
  achievements,
  kindness,
  wisdom,
  totalScore,
}: LevelBadgeSystemProps) {
  const [showAllBadges, setShowAllBadges] = useState(false);

  const currentLevel = useMemo(() => getCurrentLevel(totalScore), [totalScore]);
  const nextLevel = useMemo(() => getNextLevel(totalScore), [totalScore]);
  const progress = useMemo(() => getLevelProgress(totalScore), [totalScore]);
  const earnedBadges = useMemo(
    () => getEarnedBadges(seeds, contacts, achievements, kindness, wisdom),
    [seeds, contacts, achievements, kindness, wisdom]
  );

  return (
    <ZenCard className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
      {/* 等级展示 */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-bold"
            style={{
              background: `linear-gradient(to bottom right, var(--theme-primary), var(--theme-primary-dark))`,
              boxShadow: `0 8px 24px var(--theme-glow)`,
            }}
          >
            <span className="text-2xl sm:text-3xl">{currentLevel.icon}</span>
            <span className="text-[10px] font-medium mt-0.5" style={{ color: "var(--theme-fg)" }}>
              Lv.{currentLevel.level}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-slate-100">{currentLevel.name}</h3>
            <span className="text-xs font-mono" style={{ color: "var(--theme-primary)" }}>
              {totalScore} G
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">{currentLevel.description}</p>

          {nextLevel && (
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>距离 {nextLevel.icon} {nextLevel.name}</span>
                <span>{nextLevel.minScore - totalScore} G</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(to right, var(--theme-primary), var(--theme-primary-light))`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 等级概览 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {LEVELS.map((level) => {
          const isCurrent = level.level === currentLevel.level;
          const isPast = level.level < currentLevel.level;
          return (
            <div
              key={level.level}
              className={`flex flex-col items-center p-1.5 rounded-lg text-center ${
                isCurrent
                  ? "bg-amber-400/10 border border-amber-400/30"
                  : isPast
                  ? "opacity-60"
                  : "opacity-40"
              }`}
            >
              <span className="text-lg sm:text-xl">{level.icon}</span>
              <span className="text-[8px] text-slate-500 mt-0.5 hidden sm:block">Lv.{level.level}</span>
            </div>
          );
        })}
      </div>

      {/* 分割线 */}
      <div className="border-t border-slate-800 pt-4">
        {/* 徽章标题 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            <span className="text-sm font-medium text-slate-200">成长徽章</span>
            <span className="text-xs text-slate-500">
              {earnedBadges.length}/{BADGES.length}
            </span>
          </div>
          <button
            onClick={() => setShowAllBadges(!showAllBadges)}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <span>{showAllBadges ? "收起" : "查看全部"}</span>
            <ChevronRight
              size={12}
              className={`transition-transform ${showAllBadges ? "rotate-90" : ""}`}
            />
          </button>
        </div>

        {/* 已获得徽章 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {earnedBadges.slice(0, showAllBadges ? undefined : 6).map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center cursor-help">
                <span className="text-2xl">{badge.icon}</span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-32">
                <div className="text-xs font-medium text-slate-200">{badge.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{badge.description}</div>
              </div>
            </motion.div>
          ))}

          {!showAllBadges && earnedBadges.length > 6 && (
            <div
              onClick={() => setShowAllBadges(true)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center cursor-pointer text-slate-500 text-xs"
            >
              +{earnedBadges.length - 6}
            </div>
          )}
        </div>

        {/* 未获得徽章 */}
        <AnimatePresence>
          {showAllBadges && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 mb-2">未解锁</div>
                <div className="flex flex-wrap gap-2">
                  {BADGES.filter((b) => !earnedBadges.some((e) => e.id === b.id)).map(
                    (badge) => (
                      <div
                        key={badge.id}
                        className="group relative"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-center opacity-40 cursor-help">
                          <Lock size={16} className="text-slate-600" />
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-32">
                          <div className="text-xs font-medium text-slate-400">{badge.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {badge.description}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ZenCard>
  );
}
