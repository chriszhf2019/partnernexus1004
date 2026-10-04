import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Keyboard,
  BookOpen,
  Info,
  Flower,
  Compass,
  Activity,
  Database,
  RotateCcw,
  Volume2,
  Search,
  Home,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Heart,
  Users,
  Lightbulb,
} from "lucide-react";

interface HelpCenterProps {
  onClose: () => void;
  initialTab?: "guide" | "shortcuts" | "about";
}

type TabType = "guide" | "shortcuts" | "about";

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

export function HelpCenter({ onClose, initialTab = "guide" }: HelpCenterProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "guide", label: "使用指南", icon: <BookOpen size={14} /> },
    { id: "shortcuts", label: "快捷键", icon: <Keyboard size={14} /> },
    { id: "about", label: "关于", icon: <Info size={14} /> },
  ];

  const shortcuts: ShortcutItem[] = [
    {
      keys: ["0"],
      description: "回到首页·行动中心",
      icon: <Home size={12} />,
    },
    {
      keys: ["1"],
      description: "切换到内圆·自我生长",
      icon: <Flower size={12} />,
    },
    {
      keys: ["2"],
      description: "切换到中圆·人脉星系",
      icon: <Compass size={12} />,
    },
    {
      keys: ["3"],
      description: "切换到外圆·世界影响",
      icon: <Activity size={12} />,
    },
    {
      keys: ["Tab"],
      description: "循环切换Tab",
    },
    {
      keys: ["?"],
      description: "显示/隐藏帮助中心",
      icon: <Keyboard size={12} />,
    },
    {
      keys: ["Esc"],
      description: "关闭弹窗 / 取消",
      icon: <X size={12} />,
    },
    {
      keys: ["M"],
      description: "开关数字禅音",
      icon: <Volume2 size={12} />,
    },
    {
      keys: ["K"],
      description: "打开全局搜索",
      icon: <Search size={12} />,
    },
    {
      keys: ["D"],
      description: "打开数据管理",
      icon: <Database size={12} />,
    },
    {
      keys: ["R"],
      description: "重置演示星系",
      icon: <RotateCcw size={12} />,
    },
  ];

  const groupedShortcuts = {
    导航: shortcuts.slice(0, 5),
    通用: shortcuts.slice(5, 8),
    操作: shortcuts.slice(8),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-center-title"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="关闭帮助中心"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500/50 via-purple-500/50 to-blue-500/50" />

        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-purple-400/20 border border-amber-400/30 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-300" />
            </div>
            <div>
              <h3 id="help-center-title" className="font-display font-semibold text-slate-100 text-lg">
                帮助中心
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                探索 Momentum 的全部功能
              </p>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-slate-700 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="wait">
            {activeTab === "guide" && <GuideContent key="guide" />}
            {activeTab === "shortcuts" && <ShortcutsContent key="shortcuts" groupedShortcuts={groupedShortcuts} />}
            {activeTab === "about" && <AboutContent key="about" />}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GuideContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 pt-2"
    >
      <GuideSection
        title="🚀 快速开始"
        subtitle="5分钟上手 Momentum"
        items={[
          { icon: <Target size={14} />, text: "选择 1-3 个成长方向，系统自动生成种子" },
          { icon: <Home size={14} />, text: "每天打开首页，看看「今日任务」该做什么" },
          { icon: <Flower size={14} />, text: "点击「种种子」写下你的第一个成长目标" },
          { icon: <TrendingUp size={14} />, text: "完成任务后打卡，获得 G 值奖励" },
        ]}
      />

      <GuideSection
        title="🌱 内圆·自我生长"
        subtitle="你的自我修炼场"
        items={[
          { icon: "🌰", text: "种子系统：SMART 目标，萌芽→生长→绽放" },
          { icon: "💫", text: "技能云图：可视化你的技能投入分布" },
          { icon: "📈", text: "成长轨迹：故事化时间轴，记录里程碑" },
          { icon: "🧭", text: "季罗盘：季度 OKR，指引成长方向" },
          { icon: "🏆", text: "等级徽章：游戏化激励，7个成长等级" },
          { icon: "🤖", text: "AI Coach：成长诊断与个性化建议" },
        ]}
      />

      <GuideSection
        title="🌐 中圆·人脉星系"
        subtitle="你的人脉操作系统"
        items={[
          { icon: "👥", text: "人脉星系：节点可视化，关系强度量化" },
          { icon: "⏰", text: "智能提醒：提醒联系久未交流的重要的人" },
          { icon: "👨‍🏫", text: "导师网络：记录导师和指导收获" },
          { icon: "👨‍👩‍👧", text: "家庭/团队：和重要的人一起成长" },
        ]}
      />

      <GuideSection
        title="🌊 外圆·世界影响"
        subtitle="记录你对世界的贡献"
        items={[
          { icon: "🏆", text: "成就资产：记录你的作品和成果" },
          { icon: "💝", text: "善意涟漪：记录帮助他人的行为" },
          { icon: "📚", text: "智慧银行：收藏让你受益的金句" },
          { icon: "💰", text: "Ripple 资产：量化你的影响力" },
        ]}
      />

      <GuideSection
        title="📅 推荐使用节奏"
        subtitle="让成长成为习惯"
        items={[
          { icon: "🌅", text: "每天 5 分钟：完成今日任务 + 微记录" },
          { icon: "📝", text: "每周 30 分钟：更新种子 + AI 复盘" },
          { icon: "🧭", text: "每季 1 小时：设置季罗盘 + 回顾轨迹" },
          { icon: "📊", text: "每年 1 天：生成成长年报 + 新年规划" },
        ]}
      />

      <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-400/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-lg">💡</div>
          <div>
            <p className="text-sm text-amber-200 font-medium mb-1">第一天行动清单</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>✓ 选择 1-2 个成长方向</li>
              <li>✓ 种下你的第一颗种子</li>
              <li>✓ 添加一位重要的人脉节点</li>
              <li>✓ 完成一个今日任务</li>
              <li>✓ 试试切换主题</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ShortcutsContent({
  groupedShortcuts,
}: {
  groupedShortcuts: Record<string, ShortcutItem[]>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 pt-2"
    >
      <p className="text-xs text-slate-500">
        按 <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">?</kbd> 随时显示此面板
      </p>
      {Object.entries(groupedShortcuts).map(([group, items]) => (
        <div key={group}>
          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {group}
          </h4>
          <div className="space-y-1.5">
            {items.map((shortcut, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/40 border border-slate-800/50"
              >
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  {shortcut.icon && (
                    <span className="text-amber-400/70">{shortcut.icon}</span>
                  )}
                  <span>{shortcut.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIdx) => (
                    <React.Fragment key={keyIdx}>
                      {keyIdx > 0 && (
                        <span className="text-slate-600 text-[10px]">+</span>
                      )}
                      <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300 min-w-[20px] text-center">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-slate-600 text-center pt-2">
        提示：在输入框中输入时，数字键不会触发切换
      </p>
    </motion.div>
  );
}

function AboutContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 pt-2"
    >
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-amber-400/20 to-purple-400/20 border border-amber-400/30">
          <span className="text-3xl">念</span>
        </div>
        <h3 className="font-display text-xl text-slate-100 mb-1">Momentum</h3>
        <p className="text-sm text-slate-400">数字禅人生增值系统</p>
        <p className="text-xs text-slate-500 mt-2">v1.0.0</p>
      </div>

      <div className="bg-slate-800/30 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Lightbulb size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-200 font-medium">设计理念</p>
            <p className="text-xs text-slate-400 mt-1">
              一念一世界。你的每一个念头都在塑造你的人生。
              Momentum 帮助你把注意力放在真正重要的事情上。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Heart size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-200 font-medium">三层同心圆</p>
            <p className="text-xs text-slate-400 mt-1">
              自我生长 → 人脉星系 → 世界影响。
              从内到外，层层扩展你的生命边界。
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-200 font-medium">真正的成长</p>
            <p className="text-xs text-slate-400 mt-1">
              不是更快，而是更稳。
              不是更多，而是更深。
              不是独自前行，而是彼此照亮。
            </p>
          </div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-slate-500 text-xs">不看余晖 · 只看星光</p>
        <p className="text-slate-600 text-[10px]">© 2026 Momentum</p>
      </div>
    </motion.div>
  );
}

function GuideSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: { icon: React.ReactNode; text: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 mb-3">{subtitle}</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 p-2.5 bg-slate-800/30 border border-slate-800/50 rounded-lg"
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="text-xs text-slate-300 leading-relaxed">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
