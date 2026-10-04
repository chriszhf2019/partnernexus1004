import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Flower, Compass, Activity, Star, Heart, BookOpen } from "lucide-react";
import { search, SearchResult, SearchableData } from "../utils";

interface SearchModalProps {
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
  data: SearchableData;
}

const TYPE_ICONS = {
  seed: <Flower size={14} className="text-emerald-400" />,
  contact: <Compass size={14} className="text-sky-400" />,
  achievement: <Star size={14} className="text-amber-400" />,
  kindness: <Heart size={14} className="text-rose-400" />,
  wisdom: <BookOpen size={14} className="text-purple-400" />,
};

const TYPE_LABELS = {
  seed: "生长种子",
  contact: "星轨好友",
  achievement: "成就资产",
  kindness: "善意涟漪",
  wisdom: "思维结晶",
};

const TAB_LABELS = {
  core: "内圆",
  web: "中圆",
  ripple: "外圆",
};

export function SearchModal({ onClose, onSelectResult, data }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => search(query, data), [query, data]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            onSelectResult(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [results, selectedIndex, onSelectResult, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selectedItem = list.children[selectedIndex] as HTMLElement;
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -20 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <Search size={18} className="text-slate-500 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索种子、好友、成就..."
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 outline-none text-sm"
            aria-label="搜索"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-autocomplete="list"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded text-slate-500 hover:text-slate-300 cursor-pointer"
              aria-label="清除搜索"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-500 font-mono">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div 
          ref={listRef}
          id="search-results"
          role="listbox"
          className="max-h-[50vh] overflow-y-auto"
        >
          {query && results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-500 text-sm">未找到相关结果</p>
              <p className="text-slate-600 text-xs mt-1">尝试其他关键词</p>
            </div>
          )}

          {!query && (
            <div className="py-8 text-center">
              <p className="text-slate-500 text-sm">开始输入以搜索...</p>
              <p className="text-slate-600 text-xs mt-1">支持搜索种子、好友、成就等内容</p>
            </div>
          )}

          <AnimatePresence>
            {results.map((result, index) => (
              <motion.div
                key={`${result.type}-${result.id}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  onClick={() => onSelectResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                    index === selectedIndex
                      ? "bg-amber-400/10 border-l-2 border-l-amber-400"
                      : "hover:bg-slate-800/50 border-l-2 border-l-transparent"
                  }`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <div className="shrink-0">
                    {TYPE_ICONS[result.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${
                        index === selectedIndex ? "text-amber-300" : "text-slate-200"
                      }`}>
                        {result.title}
                      </span>
                      <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                        index === selectedIndex
                          ? "bg-amber-400/20 text-amber-300"
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {TYPE_LABELS[result.type]}
                      </span>
                    </div>
                    {result.subtitle && (
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-600">
                    {TAB_LABELS[result.tab]}
                  </span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-950/50 text-[10px] text-slate-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">↑↓</kbd>
                导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">Enter</kbd>
                跳转
              </span>
            </div>
            <span>{results.length} 个结果</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
