import React, { useState, useMemo } from "react";
import { TrajectoryNode } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Award, Calendar, Plus, Sparkles, Star, ChevronDown, ChevronUp } from "lucide-react";
import { ZenCard, SectionHeader } from "./ui";
import { safeToLocaleDateString } from "../utils/galaxy";

interface TrajectoryTimelineProps {
  nodes: TrajectoryNode[];
  onAddNode: (node: Omit<TrajectoryNode, "id">) => void;
}

export default function TrajectoryTimeline({
  nodes,
  onAddNode,
}: TrajectoryTimelineProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isBloom, setIsBloom] = useState(true);

  // Sorted by date descending (newest first)
  const sortedNodes = useMemo(
    () => [...nodes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [nodes]
  );

  const displayedNodes = showAll ? sortedNodes : sortedNodes.slice(0, 5);

  // Group by year/month for timeline sections
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, TrajectoryNode[]> = {};
    sortedNodes.forEach((node) => {
      const monthKey = node.date.slice(0, 7); // YYYY-MM
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(node);
    });
    return groups;
  }, [sortedNodes]);

  const totalG = useMemo(
    () => nodes.reduce((sum, n) => sum + n.heightValue, 0),
    [nodes]
  );
  const bloomCount = useMemo(
    () => nodes.filter((n) => n.isBloom).length,
    [nodes]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const currentMaxHeight = Math.max(...nodes.map((n) => n.heightValue), 0);
    const nextHeight = Math.min(100, Math.max(20, currentMaxHeight + 10));

    onAddNode({
      title: title.trim(),
      desc: desc.trim(),
      date: new Date().toISOString().split("T")[0],
      heightValue: nextHeight,
      isBloom,
    });

    setTitle("");
    setDesc("");
    setShowAddForm(false);
  };

  const formatDate = (dateStr: string) => {
    return safeToLocaleDateString(dateStr, "zh-CN", {
      month: "long",
      day: "numeric",
    });
  };

  const formatYearMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    return `${year}年${parseInt(month)}月`;
  };

  return (
    <ZenCard className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
      <SectionHeader
        icon={<TrendingUp size={16} />}
        title="年·轨迹 (Growth Timeline)"
        subtitle={`${nodes.length} 个成长节点 · ${bloomCount} 次绽放 · 累计 ${totalG} G 能量`}
        action={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 hover:border-amber-400/40 hover:bg-amber-400/5 text-slate-400 hover:text-amber-300 transition-all cursor-pointer"
          >
            <Plus size={12} />
            <span>记录成长</span>
          </button>
        }
      />

      {/* 添加表单 */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-950/60 border border-amber-400/20 rounded-2xl p-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
                <span className="font-medium text-amber-300 flex items-center gap-1.5">
                  <Star size={13} />
                  <span>记录成长轨迹</span>
                </span>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  关闭
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-2.5">
                <div>
                  <label className="block text-slate-500 mb-0.5 text-[11px]">事件标题</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="如: 完成 Momentum Beta 开发"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400/50 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-0.5 text-[11px]">成长故事</label>
                  <textarea
                    required
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="这一刻发生了什么，带来了哪些核心成长或影响？"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400/50 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none resize-none text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="isBloom"
                    checked={isBloom}
                    onChange={(e) => setIsBloom(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="isBloom" className="text-slate-400 cursor-pointer text-[11px]">
                    标记为「绽放时刻」
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-2 rounded-lg font-medium transition-all cursor-pointer text-sm"
                >
                  写入生命轨迹
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 时间轴 */}
      <div className="relative">
        {/* 纵向时间线 */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/40 via-amber-400/20 to-transparent" />

        <div className="space-y-6">
          {displayedNodes.map((node, index) => {
            const isExpanded = expandedId === node.id;
            const prevNode = displayedNodes[index - 1];
            const showMonthLabel =
              !prevNode ||
              prevNode.date.slice(0, 7) !== node.date.slice(0, 7);

            return (
              <React.Fragment key={node.id}>
                {/* 月份标签 */}
                {showMonthLabel && (
                  <div className="flex items-center gap-3 mb-2 -ml-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[11px] font-medium text-amber-400/80">
                      {formatYearMonth(node.date.slice(0, 7))}
                    </span>
                  </div>
                )}

                {/* 时间轴节点 */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-10 cursor-pointer group"
                  onClick={() => setExpandedId(isExpanded ? null : node.id)}
                >
                  {/* 节点圆点 */}
                  <div
                    className={`absolute left-2 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      node.isBloom
                        ? "bg-amber-400 border-amber-400 shadow-lg shadow-amber-500/30"
                        : "bg-slate-900 border-slate-600"
                    }`}
                  >
                    {node.isBloom && (
                      <Award size={10} className="text-slate-950" />
                    )}
                  </div>

                  {/* 节点卡片 */}
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      isExpanded
                        ? "bg-slate-950/60 border-amber-400/30"
                        : "bg-slate-950/30 border-slate-800/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-200 leading-snug">
                          {node.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar size={9} />
                            {formatDate(node.date)}
                          </span>
                          {node.isBloom && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 flex items-center gap-1">
                              <Sparkles size={9} />
                              绽放
                            </span>
                          )}
                          <span className="text-[10px] text-amber-400/70 font-mono">
                            +{node.heightValue} G
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-500 group-hover:text-slate-400 transition-colors flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </div>
                    </div>

                    {/* 展开的详细描述 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-slate-400 leading-relaxed pt-3 mt-2 border-t border-slate-800/50">
                            {node.desc}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {/* 展开更多 */}
        {sortedNodes.length > 5 && (
          <div className="flex justify-center mt-4 pt-4 border-t border-slate-800/50">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp size={12} />
                  收起
                </>
              ) : (
                <>
                  <ChevronDown size={12} />
                  查看全部 {sortedNodes.length} 条轨迹
                </>
              )}
            </button>
          </div>
        )}

        {/* 空状态 */}
        {nodes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-sm text-slate-500">还没有成长记录</p>
            <p className="text-xs text-slate-600 mt-1">
              点击「记录成长」开始书写你的故事
            </p>
          </div>
        )}
      </div>
    </ZenCard>
  );
}
