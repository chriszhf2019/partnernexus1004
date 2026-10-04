import React from "react";
import { Palette } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { themeList } from "../themes";

export function ThemeToggle() {
  const { theme, themeName, setTheme } = useTheme();

  return (
    <div className="relative group">
      <button
        className="w-10 h-10 rounded-full border bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center"
        title={`当前主题: ${theme.label}，点击切换`}
        aria-label={`切换主题，当前主题：${theme.label}`}
      >
        <Palette size={13} aria-hidden="true" />
      </button>

      <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl shadow-slate-950/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[160px]">
        <div className="text-[10px] text-slate-500 px-2 py-1 font-medium tracking-wide">
          选择禅意主题
        </div>
        {themeList.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs transition-all"
            style={{
              backgroundColor:
                themeName === t.name ? t.cssVars["--theme-accent-bg"] : "",
              color:
                themeName === t.name ? t.cssVars["--theme-accent-text"] : "",
            }}
            onMouseEnter={(e) => {
              if (themeName !== t.name) {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
                e.currentTarget.style.color = "#e2e8f0";
              }
            }}
            onMouseLeave={(e) => {
              if (themeName !== t.name) {
                e.currentTarget.style.backgroundColor = "";
                e.currentTarget.style.color = "";
              }
            }}
          >
            <span
              className="w-3 h-3 rounded-full border"
              style={{
                backgroundColor: t.color,
                borderColor: t.color,
              }}
            />
            <div className="flex-1">
              <div className="font-medium text-slate-200">{t.label}</div>
              <div className="text-[9px] text-slate-500">{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
