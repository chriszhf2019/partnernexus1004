import React, { memo, useState } from "react";
import { WeeklySeed } from "../types";
import { ZenBadge } from "./ui";
import { Calendar, Target, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeToLocaleDateString } from "../utils/galaxy";

interface SeedCardProps {
  seed: WeeklySeed;
  onSprout: (id: string) => void;
  onUpdateProgress?: (id: string, progress: number) => void;
}

const SeedCard = memo(function SeedCard({ seed, onSprout, onUpdateProgress }: SeedCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".seed-progress-slider")) return;
    setExpanded(!expanded);
  };

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSprout(seed.id);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpdateProgress) {
      onUpdateProgress(seed.id, Number(e.target.value));
    }
  };

  const daysLeft = seed.deadline
    ? Math.ceil((new Date(seed.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const progress = seed.progress ?? 0;

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${seed.title}，状态：${seed.status}，进度：${progress}%`}
      className="bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900 hover:border-amber-400/20 rounded-xl p-3 transition-all duration-300 cursor-pointer select-none group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs shrink-0 ${
              seed.status === "绽放"
                ? "bg-amber-400/10 border-amber-300 text-amber-300 shadow-md shadow-amber-500/5"
                : seed.status === "生长"
                ? "bg-sky-400/10 border-sky-400/30 text-sky-300"
                : "bg-slate-800/40 border-slate-700/50 text-slate-500"
            }`}
          >
            {seed.status === "绽放"
              ? "✿"
              : seed.status === "生长"
              ? "🌱"
              : "▫"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-slate-200 text-xs font-medium leading-relaxed group-hover:text-amber-300 transition-colors truncate">
              {seed.title}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500 flex-wrap">
              <ZenBadge variant="default">{seed.category}</ZenBadge>
              <span>能量: +{seed.momentumScore} G</span>
              {seed.expectedGrowth && (
                <span className="text-emerald-400">预期: +{seed.expectedGrowth} G</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
              seed.status === "绽放"
                ? "bg-amber-400 text-slate-950 font-bold"
                : seed.status === "生长"
                ? "bg-sky-400/15 text-sky-300 border border-sky-400/20 animate-pulse"
                : "bg-slate-900 text-slate-500 border border-slate-800"
            }`}
          >
            {seed.status}
          </span>
          {expanded ? (
            <ChevronUp size={14} className="text-slate-500" />
          ) : (
            <ChevronDown size={14} className="text-slate-500" />
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
          <span>进度</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{
              background: seed.status === "绽放"
                ? "linear-gradient(to right, #fbbf24, #f59e0b)"
                : seed.status === "生长"
                ? "linear-gradient(to right, #38bdf8, #0ea5e9)"
                : "linear-gradient(to right, #64748b, #475569)",
            }}
          />
        </div>
      </div>

      {/* 展开详情 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-3">
              {seed.description && (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {seed.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                {seed.deadline && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Calendar size={11} />
                    <span>
                      期限: {safeToLocaleDateString(seed.deadline, "zh-CN", { month: "short", day: "numeric" })}
                      {daysLeft !== null && daysLeft > 0 && (
                        <span className="ml-1 text-amber-400">({daysLeft}天)</span>
                      )}
                      {daysLeft !== null && daysLeft <= 0 && (
                        <span className="ml-1 text-red-400">(已到期)</span>
                      )}
                    </span>
                  </div>
                )}
                {seed.expectedGrowth && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <TrendingUp size={11} />
                    <span>预期成长: +{seed.expectedGrowth} G</span>
                  </div>
                )}
              </div>

              {/* 进度调节滑块 */}
              {onUpdateProgress && seed.status !== "绽放" && (
                <div className="seed-progress-slider">
                  <div className="flex items-center gap-2">
                    <Target size={11} className="text-slate-500 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 accent-amber-400 cursor-pointer h-1 bg-slate-800 rounded-lg"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                      {progress}%
                    </span>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={handleAdvance}
                  className="flex-1 text-[10px] py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 transition-colors font-medium"
                >
                  {seed.status === "萌芽" ? "推进到生长" : seed.status === "生长" ? "标记为绽放" : "重新萌芽"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export { SeedCard };
