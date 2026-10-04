import React, { useState } from "react";
import { Compass } from "lucide-react";
import { ZenCard, SectionHeader } from "./ui";

type Direction = "北" | "东" | "南" | "西";

const DIRECTION_COLORS: Record<Direction, string> = {
  北: "#fbbf24",
  东: "#38bdf8",
  南: "#34d399",
  西: "#e879f9",
};

const DIRECTION_LABELS: Record<Direction, { title: string; subtitle: string }> = {
  北: { title: "北 · 人生愿景", subtitle: "愿景" },
  东: { title: "东 · 本季目标", subtitle: "聚焦" },
  南: { title: "南 · 精神状态", subtitle: "心性" },
  西: { title: "西 · 创造项目", subtitle: "创造" },
};

interface QuarterlyCompassProps {
  initialContent?: Record<Direction, string[]>;
}

export function QuarterlyCompass({ initialContent }: QuarterlyCompassProps) {
  const [selectedDir, setSelectedDir] = useState<Direction>("北");
  const [content, setContent] = useState<Record<Direction, string[]>>(
    initialContent || {
      北: [
        "成为一个有深度的技术创作者",
        "建立可持续的成长体系",
        "帮助更多人找到成长方向",
      ],
      东: [
        "完成 Momentum 产品核心功能",
        "深入学习 AI Agent 技术",
        "建立 3 个以上深度合作关系",
      ],
      南: [
        "保持每日冥想 15 分钟",
        "每周阅读 1 本好书",
        "在焦虑时保持内心平静",
      ],
      西: [
        "每周发布 1 篇技术文章",
        "每月指导 1 位后浪成长",
        "保持每周 3 次运动",
      ],
    }
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const totalGoals = Object.values(content).reduce((sum, arr) => sum + arr.length, 0);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const newContent = { ...content };
    newContent[selectedDir] = [...newContent[selectedDir], newItemText.trim()];
    setContent(newContent);
    setNewItemText("");
    setIsAdding(false);
  };

  const handleRemoveItem = (index: number) => {
    const newContent = { ...content };
    newContent[selectedDir] = newContent[selectedDir].filter((_, i) => i !== index);
    setContent(newContent);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      {/* Compass Wheel (Left) */}
      <ZenCard className="md:col-span-5 flex flex-col justify-between">
        <div>
          <SectionHeader
            icon={<Compass size={16} />}
            title="季·罗盘 (Quarterly OKR)"
            subtitle="四个方向，定义你的季度成长"
          />

          {/* Compass Design */}
          <div className="relative w-full max-w-[260px] h-[260px] mx-auto bg-slate-950/80 rounded-full border-2 border-slate-800 flex items-center justify-center">
            {/* North */}
            <button
              onClick={() => setSelectedDir("北")}
              className={`absolute top-2 w-20 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                selectedDir === "北"
                  ? "font-bold shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
              style={
                selectedDir === "北"
                  ? { backgroundColor: DIRECTION_COLORS["北"], color: "#0f172a", boxShadow: `0 8px 24px ${DIRECTION_COLORS["北"]}33` }
                  : {}
              }
            >
              <div className="font-medium">北</div>
              <div className="text-[9px] opacity-70">愿景</div>
            </button>

            {/* East */}
            <button
              onClick={() => setSelectedDir("东")}
              className={`absolute right-2 w-20 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                selectedDir === "东"
                  ? "font-bold shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
              style={
                selectedDir === "东"
                  ? { backgroundColor: DIRECTION_COLORS["东"], color: "#0f172a", boxShadow: `0 8px 24px ${DIRECTION_COLORS["东"]}33` }
                  : {}
              }
            >
              <div className="font-medium">东</div>
              <div className="text-[9px] opacity-70">聚焦</div>
            </button>

            {/* South */}
            <button
              onClick={() => setSelectedDir("南")}
              className={`absolute bottom-2 w-20 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                selectedDir === "南"
                  ? "font-bold shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
              style={
                selectedDir === "南"
                  ? { backgroundColor: DIRECTION_COLORS["南"], color: "#0f172a", boxShadow: `0 8px 24px ${DIRECTION_COLORS["南"]}33` }
                  : {}
              }
            >
              <div className="font-medium">南</div>
              <div className="text-[9px] opacity-70">心性</div>
            </button>

            {/* West */}
            <button
              onClick={() => setSelectedDir("西")}
              className={`absolute left-2 w-20 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                selectedDir === "西"
                  ? "font-bold shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
              style={
                selectedDir === "西"
                  ? { backgroundColor: DIRECTION_COLORS["西"], color: "#0f172a", boxShadow: `0 8px 24px ${DIRECTION_COLORS["西"]}33` }
                  : {}
              }
            >
              <div className="font-medium">西</div>
              <div className="text-[9px] opacity-70">创造</div>
            </button>

            {/* Center core */}
            <div
              className="w-14 h-14 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: DIRECTION_COLORS[selectedDir] }}
            >
              <span
                className="font-display text-sm font-semibold"
                style={{ color: DIRECTION_COLORS[selectedDir] }}
              >
                {selectedDir}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 italic mt-3 text-center">
          四个方向定义你的季度成长，添加自己的目标
        </p>
      </ZenCard>

      {/* Goals List (Right) */}
      <ZenCard className="md:col-span-7 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
            <div>
              <span className="text-[10px] text-slate-500 font-mono">季度 OKR</span>
              <h4 className="font-sans font-semibold text-slate-200 text-base mt-0.5">
                {DIRECTION_LABELS[selectedDir].title}
              </h4>
            </div>
            <button
              onClick={() => {
                setIsAdding(true);
                setNewItemText("");
              }}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              + 添加目标
            </button>
          </div>

          {/* 目标列表 */}
          <div className="space-y-2">
            {content[selectedDir].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors"
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                  style={{ borderColor: DIRECTION_COLORS[selectedDir] }}
                  onClick={() => handleRemoveItem(idx)}
                />
                <span className="text-sm text-slate-300 leading-relaxed flex-1">
                  {item}
                </span>
              </div>
            ))}

            {content[selectedDir].length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500 italic">
                还没有设定目标，点击「添加目标」开始吧
              </div>
            )}
          </div>

          {/* 添加输入框 */}
          {isAdding && (
            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-700">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddItem();
                  if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewItemText("");
                  }
                }}
                placeholder="输入你的季度目标..."
                autoFocus
                className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewItemText("");
                  }}
                  className="text-[11px] px-3 py-1 text-slate-500 hover:text-slate-300"
                >
                  取消
                </button>
                <button
                  onClick={handleAddItem}
                  className="text-[11px] px-3 py-1 rounded-lg text-slate-950 font-medium"
                  style={{ backgroundColor: DIRECTION_COLORS[selectedDir] }}
                >
                  添加
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800/80 pt-3 mt-4 text-[10px] text-slate-500">
          <div className="flex items-center justify-between">
            <span>* 每季度初回顾和设定，指引成长方向</span>
            <span>{totalGoals} 个目标</span>
          </div>
        </div>
      </ZenCard>
    </div>
  );
}
