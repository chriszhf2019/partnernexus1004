import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  WeeklySeed, 
  GalaxyNode, 
  Achievement, 
  KindnessRecord, 
  WisdomBankItem, 
  TrajectoryNode,
} from "./types";
import { 
  initialSeeds, 
  initialFriends, 
  initialAchievements, 
  initialKindnessRipples, 
  initialWisdomItems, 
  initialTrajectoryNodes 
} from "./data";

import { CoreTab } from "./components/CoreTab";
import { GalaxyTab } from "./components/GalaxyTab";
import { RippleTab } from "./components/RippleTab";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DataManager } from "./components/DataManager";
import { HelpCenter } from "./components/HelpCenter";
import { MobileTabBar } from "./components/MobileTabBar";
import { SearchModal } from "./components/SearchModal";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ThemeToggle } from "./components/ThemeToggle";

import { useLocalStorage, useBreathing, useZenSound, useKeyboardShortcuts, useSwipe } from "./hooks";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import { AuthScreen } from "./components/AuthScreen";
import { LegalPage } from "./components/LegalPage";
import { OnboardingModal, generateSeedsFromAreas } from "./components/OnboardingModal";
import { GrowthScorePanel } from "./components/GrowthScorePanel";
import { calculateGrowthScore } from "./utils/growthScore";
import { Dashboard } from "./components/Dashboard";
import { FloatingReward, useStreak } from "./components/FloatingReward";
import { AnnualReport } from "./components/AnnualReport";

import { motion, AnimatePresence } from "motion/react";
import { 
  Flower, 
  Compass, 
  Activity,
  Volume2,
  VolumeX,
  RotateCcw,
  Heart,
  Database,
  Keyboard,
  Search,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

export default function App() {
  // Hooks 必须在最前面调用
  const { user, loading: authLoading, isAuthenticated, isGuest, logout } = useAuth();
  const [legalPage, setLegalPage] = useState<"privacy" | "terms" | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "core" | "web" | "ripple">("home");
  const { cycleTheme } = useTheme();

  // 派生值：当前用户的数据 key
  const dataKey = user ? `momentum_${user.id}` : "momentum_guest";

  // Hooks 顺序保持稳定 - 始终调用所有 useState
  const [seeds, setSeeds] = useLocalStorage<WeeklySeed[]>(`momentum_seeds_${dataKey}`, initialSeeds);
  const [contacts, setContacts] = useLocalStorage<GalaxyNode[]>(`momentum_contacts_${dataKey}`, initialFriends);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(`momentum_achievements_${dataKey}`, initialAchievements);
  const [kindnessRipples, setKindnessRipples] = useLocalStorage<KindnessRecord[]>(`momentum_kindnessRipples_${dataKey}`, initialKindnessRipples);
  const [wisdomItems, setWisdomItems] = useLocalStorage<WisdomBankItem[]>(`momentum_wisdomItems_${dataKey}`, initialWisdomItems);
  const [trajectoryNodes, setTrajectoryNodes] = useLocalStorage<TrajectoryNode[]>(`momentum_trajectoryNodes_${dataKey}`, initialTrajectoryNodes);

  // URL 路由：隐私政策和服务条款
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/privacy") setLegalPage("privacy");
    else if (path === "/terms") setLegalPage("terms");
  }, []);

  // 数据迁移：确保联系人数据字段完整（兼容旧版本数据）
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let hasChanges = false;
    const cleaned = contacts.map((c) => {
      let changed = false;
      const cleaned = { ...c };

      if (!cleaned.firstMetDate || isNaN(new Date(cleaned.firstMetDate).getTime())) {
        cleaned.firstMetDate = cleaned.createdAt?.split("T")[0] || todayStr;
        changed = true;
      }
      if (!cleaned.lastInteractionDate || isNaN(new Date(cleaned.lastInteractionDate).getTime())) {
        cleaned.lastInteractionDate = cleaned.firstMetDate || todayStr;
        changed = true;
      }
      if (!cleaned.meetSource) {
        cleaned.meetSource = "其他";
        changed = true;
      }
      if (!cleaned.resonanceFrequency) {
        cleaned.resonanceFrequency = "月";
        changed = true;
      }
      if (cleaned.sharedRipplesCount === undefined || cleaned.sharedRipplesCount === null) {
        cleaned.sharedRipplesCount = 0;
        changed = true;
      }
      if (cleaned.resonancePulse === undefined || cleaned.resonancePulse === null) {
        cleaned.resonancePulse = false;
        changed = true;
      }

      if (changed) hasChanges = true;
      return cleaned;
    });

    if (hasChanges) {
      setContacts(cleaned);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 切换法律页面
  const navigateLegal = (page: "privacy" | "terms" | null) => {
    if (page) {
      window.history.pushState({}, "", `/${page}`);
      setLegalPage(page);
    } else {
      window.history.pushState({}, "", "/");
      setLegalPage(null);
    }
  };

  const [isSoundOn, setIsSoundOn] = useState(false);
  const { playZenBell } = useZenSound();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useLocalStorage("momentum_onboarding_complete", false);
  const [showDashboard, setShowDashboard] = useLocalStorage("momentum_show_dashboard", true);
  const [showAnnualReport, setShowAnnualReport] = useState(false);

  const { streak, checkIn, canCheckIn } = useStreak();
  const [floatingReward, setFloatingReward] = useState<{
    show: boolean;
    value: number;
    type: "growth" | "streak" | "achievement";
    label?: string;
  }>({ show: false, value: 0, type: "growth" });

  const triggerReward = (value: number, type: "growth" | "streak" | "achievement" = "growth", label = "G") => {
    setFloatingReward({ show: true, value, type, label });
  };

  const handleCheckIn = () => {
    const result = checkIn();
    if (result.isNew) {
      triggerReward(result.streak, "streak", "天连续打卡");
    }
  };

  const { breathPhase, breathSeconds } = useBreathing(isSoundOn);

  const [activeRippleEffect, setActiveRippleEffect] = useState<{ id: string; target: string; depth: number } | null>(null);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const zenQuotes = [
    "“生命短短，不看余晖，看星光。”",
    "“向下深扎自我的根系，向外漫流善良的涟漪。”",
    "“星空并非催促我们赶路，而是静立在恒常轨道上等待我们的共振。”",
    "“时间不是减法，是在虚无的时间轴上积聚生长粒子的层层加法。”"
  ];

  const handleToggleSound = () => {
    const nextVal = !isSoundOn;
    setIsSoundOn(nextVal);
    if (nextVal) {
      playZenBell("静止");
    }
  };

  // 处理 onboarding 完成
  const handleOnboardingComplete = (selectedAreas: string[]) => {
    if (selectedAreas.length > 0) {
      const newSeeds = generateSeedsFromAreas(selectedAreas).map((seed, index) => ({
        id: `seed-${Date.now()}-${index}`,
        title: seed.title,
        category: seed.category,
        momentumScore: 5,
        status: "萌芽" as const,
        createdAt: new Date().toISOString().split("T")[0],
      }));
      setSeeds((prev) => [...newSeeds, ...prev]);
    }
    setShowOnboarding(true);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(true);
  };

  const handleResetSandbox = useCallback(() => {
    setSeeds(initialSeeds);
    setContacts(initialFriends);
    setAchievements(initialAchievements);
    setKindnessRipples(initialKindnessRipples);
    setWisdomItems(initialWisdomItems);
    setTrajectoryNodes(initialTrajectoryNodes);
    setShowResetConfirm(false);
  }, [setSeeds, setContacts, setAchievements, setKindnessRipples, setWisdomItems, setTrajectoryNodes]);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % zenQuotes.length);
    }, 15000);
    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleDataImported = () => {
    window.location.reload();
  };

  // 计算成长积分
  const scoreBreakdown = useMemo(
    () => calculateGrowthScore(seeds, contacts, achievements, kindnessRipples, wisdomItems),
    [seeds, contacts, achievements, kindnessRipples, wisdomItems]
  );

  // 处理Dashboard快捷操作
  const handleDashboardQuickAction = (action: "addSeed" | "addContact" | "checkIn") => {
    switch (action) {
      case "addSeed":
        setActiveTab("core");
        // 滚动到种子添加区域
        setTimeout(() => {
          document.getElementById("seed-input-area")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        break;
      case "addContact":
        setActiveTab("web");
        setTimeout(() => {
          document.getElementById("contact-input-area")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        break;
      case "checkIn":
        setActiveTab("core");
        setTimeout(() => {
          document.getElementById("journal-area")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        break;
    }
  };

  const closeAllModals = useCallback(() => {
    setShowResetConfirm(false);
    setShowDataManager(false);
    setShowHelpCenter(false);
    setShowSearch(false);
  }, []);

  const shortcuts = useMemo(
    () => [
      {
        key: "0",
        description: "切换到首页",
        handler: () => {
          setActiveTab("home");
          setShowDashboard(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
      {
        key: "1",
        description: "切换到内圆",
        handler: () => setActiveTab("core"),
      },
      {
        key: "2",
        description: "切换到中圆",
        handler: () => setActiveTab("web"),
      },
      {
        key: "3",
        description: "切换到外圆",
        handler: () => setActiveTab("ripple"),
      },
      {
        key: "Tab",
        description: "循环切换Tab",
        handler: () => {
          setActiveTab((prev) => {
            if (prev === "home") return "core";
            if (prev === "core") return "web";
            if (prev === "web") return "ripple";
            return "home";
          });
        },
      },
      {
        key: "?",
        description: "显示帮助中心",
        handler: () => setShowHelpCenter(true),
      },
      {
        key: "/",
        description: "显示帮助中心",
        handler: () => setShowHelpCenter(true),
        preventDefault: false,
      },
      {
        key: "Escape",
        description: "关闭弹窗",
        handler: closeAllModals,
      },
      {
        key: "m",
        description: "切换禅音",
        handler: handleToggleSound,
      },
      {
        key: "d",
        description: "打开数据管理",
        handler: () => setShowDataManager(true),
      },
      {
        key: "r",
        description: "重置演示星系",
        handler: () => setShowResetConfirm(true),
      },
      {
        key: "k",
        description: "打开全局搜索",
        handler: () => setShowSearch(true),
      },
      {
        key: "t",
        description: "切换主题",
        handler: cycleTheme,
      },
    ],
    [closeAllModals, cycleTheme]
  );

  useKeyboardShortcuts(shortcuts);

  const handleSelectSearchResult = useCallback(
    (result: { tab: "home" | "core" | "web" | "ripple" }) => {
      setActiveTab(result.tab);
      if (result.tab === "home") {
        setShowDashboard(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setShowSearch(false);
    },
    []
  );

  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleSwipeLeft = useCallback(() => {
    setActiveTab((prev) => {
      if (prev === "home") return "core";
      if (prev === "core") return "web";
      if (prev === "web") return "ripple";
      return prev;
    });
  }, []);

  const handleSwipeRight = useCallback(() => {
    setActiveTab((prev) => {
      if (prev === "ripple") return "web";
      if (prev === "web") return "core";
      if (prev === "core") return "home";
      return prev;
    });
  }, []);

  useSwipe(mainContentRef, {
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 60,
  });

  // 加载法律页面（hooks 之后判断，确保 hooks 顺序稳定）
  if (legalPage) {
    return <LegalPage type={legalPage} onClose={() => navigateLegal(null)} />;
  }

  // 加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">念 · 加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录时显示登录页
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative selection:bg-amber-400 selection:text-slate-950">

      {/* Onboarding Modal */}
      <AnimatePresence>
        {!showOnboarding && (
          <OnboardingModal
            isOpen={!showOnboarding}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeRippleEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px]"
          >
            <div className="relative flex items-center justify-center">
              
              {[...Array(activeRippleEffect.depth)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 40, height: 40, opacity: 0.8 }}
                  animate={{ 
                    width: 100 + i * 160, 
                    height: 100 + i * 160, 
                    opacity: 0,
                    transition: { duration: 2.2, ease: "easeOut", repeat: Infinity, repeatDelay: 0.1 }
                  }}
                  className="absolute border border-amber-400/30 rounded-full"
                />
              ))}

              <motion.div
                initial={{ scale: 0.8, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-slate-900/90 border border-amber-400 px-6 py-4 rounded-2xl text-center max-w-sm shadow-2xl shadow-amber-950/35 pointer-events-auto backdrop-blur-md"
              >
                <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400 flex items-center justify-center mx-auto mb-2 text-amber-300">
                  <Heart size={18} className="animate-pulse" />
                </div>
                <h4 className="font-sans font-semibold text-amber-300 text-sm">
                  善意涟漪漫流：{activeRippleEffect.target}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  微光漫流，引力传递。你给予他人的能量正在同心圆中层层扩散。
                </p>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isGuest && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-purple-500/10 border-b border-amber-400/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-amber-400" />
              <span className="text-xs text-slate-300">
                您正在以<span className="text-amber-300 font-medium mx-1">访客模式</span>体验，数据保存在本地
              </span>
            </div>
            <button
              onClick={logout}
              className="text-xs px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 transition-all cursor-pointer"
            >
              创建账号，永久保存我的数据
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-slate-900 bg-slate-950/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                 style={{
                   background: `linear-gradient(to top right, var(--theme-primary), var(--theme-primary-dark))`,
                   boxShadow: `0 10px 15px -3px var(--theme-glow)`,
                 }}>
              <span className="font-display font-bold text-base" style={{ color: "var(--theme-fg)" }}>念</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-semibold text-slate-200 text-base tracking-wide">
                  Momentum
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  念·同心圆
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                自我生长 · 人脉星系 · 涟漪世界 
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500">
            <span>自我生长</span>
            <span className="text-slate-700">·</span>
            <span>人脉星系</span>
            <span className="text-slate-700">·</span>
            <span>涟漪世界</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleToggleSound}
              title={isSoundOn ? "关闭数字禅音" : "开启数字禅音 (西藏颂钵)"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all cursor-pointer flex items-center justify-center"
              style={{
                backgroundColor: isSoundOn ? "var(--theme-accent-bg)" : "",
                borderColor: isSoundOn ? "var(--theme-accent-border)" : "",
                color: isSoundOn ? "var(--theme-accent-text)" : "",
                boxShadow: isSoundOn ? "0 4px 6px -1px var(--theme-glow)" : "",
              }}
            >
              {isSoundOn ? <Volume2 size={13} className="animate-pulse" aria-hidden="true" /> : <VolumeX size={13} aria-hidden="true" />}
            </button>

            <button
              onClick={() => setShowSearch(true)}
              title="全局搜索 (K)"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center"
            >
              <Search size={13} aria-hidden="true" />
            </button>

            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-full py-1.5 px-4.5 text-xs">
              <div className="relative w-4 h-4 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: breathPhase === "吸气" ? 1.6 : breathPhase === "呼气" ? 0.9 : 1.6,
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="w-3.5 h-3.5 rounded-full border"
                  style={{
                    borderColor: "var(--theme-accent-border)",
                    backgroundColor: breathPhase === "静止" ? "var(--theme-accent-bg)" : "var(--theme-accent-bg)",
                    opacity: breathPhase === "静止" ? 0.7 : 0.4,
                  }}
                />
              </div>
              <div className="font-mono text-[11px]">
                <span className="text-slate-500">正念静息:</span>{" "}
                <span style={{ color: "var(--theme-accent-text)" }} className="font-medium">{breathPhase}</span>{" "}
                <span className="text-slate-400 font-bold">({breathSeconds}s)</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      <main ref={mainContentRef} className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 flex flex-col gap-4 sm:gap-5 md:gap-6 pb-24 md:pb-6 touch-pan-y">

        {/* 移动端：首页模式只显示Dashboard */}
        <AnimatePresence mode="wait">
          {activeTab === "home" ? (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {!isLoading && (
                <Dashboard
                  seeds={seeds}
                  contacts={contacts}
                  kindnessRipples={kindnessRipples}
                  wisdomItems={wisdomItems}
                  achievements={achievements}
                  scoreBreakdown={scoreBreakdown}
                  onQuickAction={handleDashboardQuickAction}
                  streak={streak}
                  canCheckIn={canCheckIn()}
                  onCheckIn={handleCheckIn}
                  onEarnReward={triggerReward}
                  onOpenAnnualReport={() => setShowAnnualReport(true)}
                />
              )}

              {/* 成长积分面板（卡片化展示） */}
              {!isLoading && (
                <GrowthScorePanel
                  breakdown={calculateGrowthScore(seeds, contacts, achievements, kindnessRipples, wisdomItems)}
                />
              )}

              {/* 快速入口卡片 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("core")}
                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Flower size={20} className="text-amber-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-200">内圆·自我生长</h3>
                  <p className="text-[11px] text-slate-500 mt-1">种子 · 技能 · 轨迹 · 罗盘</p>
                </button>

                <button
                  onClick={() => setActiveTab("web")}
                  className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/30 to-slate-900 border border-blue-500/20 hover:border-blue-500/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Compass size={20} className="text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-200">中圆·人脉星系</h3>
                  <p className="text-[11px] text-slate-500 mt-1">关系 · 导师 · 团队</p>
                </button>

                <button
                  onClick={() => setActiveTab("ripple")}
                  className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-slate-900 border border-purple-500/20 hover:border-purple-500/40 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Activity size={20} className="text-purple-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-200">外圆·世界影响</h3>
                  <p className="text-[11px] text-slate-500 mt-1">成就 · 善意 · 智慧</p>
                </button>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/20">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center mb-3">
                    <Sparkles size={20} className="text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-200">AI Coach</h3>
                  <p className="text-[11px] text-slate-500 mt-1">成长诊断 · 建议</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-5 md:space-y-6"
            >
              {/* 桌面端Tab导航 */}
              <div className="hidden md:flex justify-center">
                <div 
                  role="tablist"
                  aria-label="三圆模块导航"
                  className="bg-slate-900/80 p-1 rounded-full border border-slate-800 flex items-center gap-1"
                >
                  <button
                    role="tab"
                    aria-selected={activeTab === "core"}
                    aria-controls={`tab-panel-${activeTab}`}
                    onClick={() => setActiveTab("core")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium tracking-wide cursor-pointer transition-all"
                    style={activeTab === "core" ? {
                      backgroundColor: "var(--theme-primary)",
                      color: "var(--theme-fg)",
                      fontWeight: 600,
                      boxShadow: "0 10px 15px -3px var(--theme-glow)",
                    } : {
                      color: "",
                    }}
                  >
                    <Flower size={14} aria-hidden="true" />
                    <span className={activeTab === "core" ? "" : "text-slate-400 hover:text-slate-200"}>
                      内圆·自我生长 (Rhythm)
                    </span>
                  </button>
                  
                  <button
                    role="tab"
                    aria-selected={activeTab === "web"}
                    aria-controls={`tab-panel-${activeTab}`}
                    onClick={() => setActiveTab("web")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium tracking-wide cursor-pointer transition-all"
                    style={activeTab === "web" ? {
                      backgroundColor: "var(--theme-primary)",
                      color: "var(--theme-fg)",
                      fontWeight: 600,
                      boxShadow: "0 10px 15px -3px var(--theme-glow)",
                    } : {}}
                  >
                    <Compass size={14} aria-hidden="true" />
                    <span className={activeTab === "web" ? "" : "text-slate-400 hover:text-slate-200"}>
                      中圆·人脉星系 (Galaxy)
                    </span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={activeTab === "ripple"}
                    aria-controls={`tab-panel-${activeTab}`}
                    onClick={() => setActiveTab("ripple")}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium tracking-wide cursor-pointer transition-all"
                    style={activeTab === "ripple" ? {
                      backgroundColor: "var(--theme-primary)",
                      color: "var(--theme-fg)",
                      fontWeight: 600,
                      boxShadow: "0 10px 15px -3px var(--theme-glow)",
                    } : {}}
                  >
                    <Activity size={14} aria-hidden="true" />
                    <span className={activeTab === "ripple" ? "" : "text-slate-400 hover:text-slate-200"}>
                      外圆·世界影响 (Ripple)
                    </span>
                  </button>
                </div>
              </div>

              {/* 移动端返回首页按钮 */}
              <button
                onClick={() => setActiveTab("home")}
                className="md:hidden flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>返回首页</span>
              </button>

              {/* 成长积分面板 */}
              {!isLoading && (
                <GrowthScorePanel
                  breakdown={calculateGrowthScore(seeds, contacts, achievements, kindnessRipples, wisdomItems)}
                />
              )}

              <div 
                id={`tab-panel-${activeTab}`}
                role="tabpanel"
                aria-label={activeTab === "core" ? "内圆·自我生长" : activeTab === "web" ? "中圆·人脉星系" : "外圆·世界影响"}
                className="flex-1"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading-skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LoadingSkeleton tab={activeTab} />
                    </motion.div>
                  ) : (
                    <>
                      {activeTab === "core" && (
                        <motion.div
                          key="tab-core"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CoreTab
                            seeds={seeds}
                            setSeeds={setSeeds}
                            trajectoryNodes={trajectoryNodes}
                            onAddTrajectoryNode={(nodeData) => {
                              const newNode = {
                                ...nodeData,
                                id: `traj-${Date.now()}`,
                              };
                              setTrajectoryNodes((prev) => [...prev, newNode]);
                            }}
                            contacts={contacts}
                            achievements={achievements}
                            kindnessRipples={kindnessRipples}
                            wisdomItems={wisdomItems}
                            totalScore={scoreBreakdown.totalScore}
                          />
                        </motion.div>
                      )}

                      {activeTab === "web" && (
                        <motion.div
                          key="tab-galaxy"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <GalaxyTab
                            contacts={contacts}
                            setContacts={setContacts}
                          />
                        </motion.div>
                      )}

                      {activeTab === "ripple" && (
                        <motion.div
                          key="tab-ripple"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RippleTab
                            achievements={achievements}
                            setAchievements={setAchievements}
                            kindnessRipples={kindnessRipples}
                            setKindnessRipples={setKindnessRipples}
                            wisdomItems={wisdomItems}
                            setWisdomItems={setWisdomItems}
                            contacts={contacts}
                            setContacts={setContacts}
                            activeRippleEffect={activeRippleEffect}
                            setActiveRippleEffect={setActiveRippleEffect}
                          />
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-amber-500/50" />
              <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-300">
                <RotateCcw size={20} className="animate-pulse" />
              </div>
              <h3 className="font-sans font-semibold text-slate-200 text-sm">
                确定重置星系数据吗？
              </h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                此操作将清空您当前记录的所有生长种子、人脉节点、成就资产、善意涟漪和思维结晶，并恢复至系统初始预置的数字禅演示数据。
              </p>
              
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs py-2 rounded-xl transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleResetSandbox}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs py-2 rounded-xl transition-all cursor-pointer"
                >
                  确认重置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <footer className="hidden md:block border-t border-slate-900 bg-slate-950/80 py-5 text-center mt-8 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px] font-sans">
          <div className="flex items-center gap-3">
            <span>© 2026 Momentum (念) 极简数字禅人生增值系统</span>
            {user && (
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span className="text-amber-400/70">{user.email}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => setShowHelpCenter(true)}
              className="text-slate-600 hover:text-amber-400/80 flex items-center gap-1 transition-colors cursor-pointer bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 hover:border-slate-800 px-2.5 py-1 rounded-lg"
              title="帮助中心 (?)"
            >
              <Keyboard size={10} />
              <span>帮助</span>
            </button>
            <button
              onClick={() => navigateLegal("privacy")}
              className="text-slate-600 hover:text-amber-400/80 transition-colors cursor-pointer bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 hover:border-slate-800 px-2.5 py-1 rounded-lg"
            >
              隐私政策
            </button>
            <button
              onClick={() => navigateLegal("terms")}
              className="text-slate-600 hover:text-amber-400/80 transition-colors cursor-pointer bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 hover:border-slate-800 px-2.5 py-1 rounded-lg"
            >
              服务条款
            </button>
            <button
              onClick={() => setShowDataManager(true)}
              className="text-slate-600 hover:text-amber-400/80 flex items-center gap-1 transition-colors cursor-pointer bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 hover:border-slate-800 px-2.5 py-1 rounded-lg"
            >
              <Database size={10} />
              <span>数据管理</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-slate-600 hover:text-amber-400/80 flex items-center gap-1 transition-colors cursor-pointer bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 hover:border-slate-800 px-2.5 py-1 rounded-lg"
            >
              <RotateCcw size={10} />
              <span>重置</span>
            </button>
            {user && (
              <button
                onClick={async () => {
                  if (confirm("确定要退出登录吗？")) {
                    await logout();
                  }
                }}
                className="text-slate-600 hover:text-rose-400/80 flex items-center gap-1 transition-colors cursor-pointer bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 hover:border-rose-400/20 px-2.5 py-1 rounded-lg"
                title="退出登录"
              >
                <span>退出</span>
              </button>
            )}
            <span className="text-slate-700 ml-1">不看余晖 · 只看星光</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showDataManager && (
          <DataManager
            onClose={() => setShowDataManager(false)}
            onDataImported={handleDataImported}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelpCenter && (
          <HelpCenter onClose={() => setShowHelpCenter(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <SearchModal
            onClose={() => setShowSearch(false)}
            onSelectResult={handleSelectSearchResult}
            data={{
              seeds,
              contacts,
              achievements,
              kindnessRipples,
              wisdomItems,
            }}
          />
        )}
      </AnimatePresence>

      {/* 浮动奖励动画 */}
      <FloatingReward
        show={floatingReward.show}
        value={floatingReward.value}
        type={floatingReward.type}
        label={floatingReward.label}
        onComplete={() => setFloatingReward((prev) => ({ ...prev, show: false }))}
      />

      {/* 年度报告 */}
      <AnnualReport
        isOpen={showAnnualReport}
        onClose={() => setShowAnnualReport(false)}
        seeds={seeds}
        contacts={contacts}
        achievements={achievements}
        kindnessRipples={kindnessRipples}
        wisdomItems={wisdomItems}
        scoreBreakdown={scoreBreakdown}
      />

    </div>
    </ErrorBoundary>
  );
}
