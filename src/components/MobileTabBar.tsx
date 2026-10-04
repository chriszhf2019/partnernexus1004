import React from "react";
import { Flower, Compass, Activity, Home } from "lucide-react";

type TabType = "home" | "core" | "web" | "ripple";

interface MobileTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  {
    id: "home" as const,
    label: "首页",
    sublabel: "行动中心",
    icon: Home,
  },
  {
    id: "core" as const,
    label: "内圆",
    sublabel: "自我生长",
    icon: Flower,
  },
  {
    id: "web" as const,
    label: "中圆",
    sublabel: "人脉星系",
    icon: Compass,
  },
  {
    id: "ripple" as const,
    label: "外圆",
    sublabel: "世界影响",
    icon: Activity,
  },
];

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe"
      aria-label="移动端模块导航"
    >
      <div className="flex items-center justify-around px-1" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`${tab.label}：${tab.sublabel}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-h-[56px] transition-all cursor-pointer ${
                isActive
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} aria-hidden="true" />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" aria-hidden="true" />
                )}
              </div>
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
