import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Keyboard, Flower, Compass, Activity, Database, RotateCcw, Volume2, Search } from "lucide-react";

interface ShortcutHelpProps {
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

export function ShortcutHelp({ onClose }: ShortcutHelpProps) {
  const shortcuts: ShortcutItem[] = [
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
      description: "循环切换三圆模块",
    },
    {
      keys: ["?"],
      description: "显示/隐藏快捷键帮助",
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
    导航: shortcuts.slice(0, 4),
    通用: shortcuts.slice(4, 8),
    操作: shortcuts.slice(7),
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
      aria-labelledby="shortcut-help-title"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="关闭快捷键帮助"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="absolute top-0 inset-x-0 h-1 bg-amber-500/50" />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Keyboard size={18} />
          </div>
          <div>
            <h3 id="shortcut-help-title" className="font-sans font-semibold text-slate-200 text-sm">
              键盘快捷键
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              按 <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">?</kbd> 随时显示此面板
            </p>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
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
                        <span className="text-amber-400/70">
                          {shortcut.icon}
                        </span>
                      )}
                      <span>{shortcut.description}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          {keyIdx > 0 && (
                            <span className="text-slate-600 text-[10px]">
                              +
                            </span>
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
        </div>

        <p className="text-[10px] text-slate-600 mt-4 text-center">
          提示：在输入框中输入时，数字键不会触发切换
        </p>
      </motion.div>
    </motion.div>
  );
}
