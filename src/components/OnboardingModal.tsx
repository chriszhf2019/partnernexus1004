import React, { useState } from "react";
import { motion } from "motion/react";
import { ZenButton } from "./ZenButton";
import { Sparkles, ArrowRight, X, Check, Users, Lightbulb, Heart } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (selections: string[]) => void;
  onSkip: () => void;
}

const growthAreas = [
  { id: "wealth", label: "财富", icon: "💰", desc: "财务自由、理财投资、副业收入" },
  { id: "health", label: "健康", icon: "💪", desc: "运动健身、饮食管理、睡眠质量" },
  { id: "learning", label: "学习", icon: "📚", desc: "知识积累、技能提升、持续成长" },
  { id: "career", label: "事业", icon: "🚀", desc: "职业发展、创业梦想、影响力扩展" },
  { id: "relationships", label: "人际关系", icon: "🤝", desc: "亲密关系、家庭和谐、社交拓展" },
  { id: "creativity", label: "创造力", icon: "✨", desc: "艺术创作、内容输出、解决问题" },
];

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState<"welcome" | "select" | "complete">("welcome");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const handleToggleArea = (id: string) => {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    onComplete(selectedAreas);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(2, 6, 23, 0.9)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900/95 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
      >
        {/* Welcome Step */}
        {step === "welcome" && (
          <>
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: `linear-gradient(to top right, var(--theme-primary), var(--theme-primary-dark))`,
                }}
              >
                <span className="text-3xl" style={{ color: "var(--theme-fg)" }}>念</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-100 mb-2">
                欢迎来到 Momentum
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                这是一个人生成长操作系统，帮助你追踪自我成长、人脉网络与世界影响力。
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                如何使用 Momentum
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb size={12} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">种下成长种子</p>
                    <p className="text-xs text-slate-500">写下你想成长的方向，追踪每周进展</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-400/10 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users size={12} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">构建关系星系</p>
                    <p className="text-xs text-slate-500">记录重要的人脉节点，观察连接扩展</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-400/10 border border-purple-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart size={12} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">观察世界涟漪</p>
                    <p className="text-xs text-slate-500">记录善意行为，感受影响力的扩散</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <ZenButton variant="ghost" onClick={onSkip} className="flex-1">
                跳过引导
              </ZenButton>
              <ZenButton onClick={() => setStep("select")} className="flex-1">
                开始设置
                <ArrowRight size={14} />
              </ZenButton>
            </div>
          </>
        )}

        {/* Select Step */}
        {step === "select" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-slate-100">
                你想专注于哪些成长方向？
              </h2>
              <button
                onClick={onSkip}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-5">
              选择 1-3 个你最关心的方向，我们会为你生成初始种子。
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {growthAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleToggleArea(area.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedAreas.includes(area.id)
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-slate-800 bg-slate-800/30 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{area.icon}</span>
                    <span className="text-sm font-medium text-slate-200">{area.label}</span>
                    {selectedAreas.includes(area.id) && (
                      <Check size={14} className="text-amber-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{area.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <ZenButton
                variant="ghost"
                onClick={() => setStep("welcome")}
                className="flex-1"
              >
                上一步
              </ZenButton>
              <ZenButton
                onClick={() => setStep("complete")}
                disabled={selectedAreas.length === 0}
                className="flex-1"
              >
                确认选择 ({selectedAreas.length})
              </ZenButton>
            </div>
          </>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: `linear-gradient(to top right, var(--theme-primary), var(--theme-primary-dark))`,
                }}
              >
                <Check size={28} style={{ color: "var(--theme-fg)" }} />
              </motion.div>
              <h2 className="text-xl font-display font-bold text-slate-100 mb-2">
                你的成长星系已初始化！
              </h2>
              <p className="text-sm text-slate-400">
                我们根据你的选择生成了种子，开始你的成长之旅吧。
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-4 mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3">为你生成的种子：</h3>
              <div className="space-y-2">
                {selectedAreas.map((areaId) => {
                  const area = growthAreas.find((a) => a.id === areaId);
                  return area ? (
                    <div
                      key={area.id}
                      className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg"
                    >
                      <span className="text-lg">{area.icon}</span>
                      <div>
                        <p className="text-sm text-slate-200">{area.label} 成长计划</p>
                        <p className="text-xs text-slate-500">持续追踪 · 每周复盘</p>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <ZenButton onClick={handleComplete} className="w-full">
              开始探索
              <ArrowRight size={14} />
            </ZenButton>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// Helper function to generate seeds based on selected areas
type SeedCategory = "智慧" | "创造" | "连结" | "心性" | "体魄";

export function generateSeedsFromAreas(areas: string[]): {
  title: string;
  category: SeedCategory;
}[] {
  const seedTemplates: Record<string, { title: string; category: SeedCategory }> = {
    wealth: { title: "财富认知升级", category: "智慧" },
    health: { title: "每日运动习惯", category: "体魄" },
    learning: { title: "深度学习计划", category: "智慧" },
    career: { title: "核心技能打磨", category: "创造" },
    relationships: { title: "高质量社交连接", category: "连结" },
    creativity: { title: "创造性输出练习", category: "创造" },
  };

  return areas.map((areaId) => seedTemplates[areaId]).filter(Boolean) as { title: string; category: SeedCategory }[];
}
