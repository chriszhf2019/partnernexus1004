import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Flame, Star } from "lucide-react";

interface FloatingRewardProps {
  show: boolean;
  value: number;
  label?: string;
  type?: "growth" | "streak" | "achievement";
  onComplete?: () => void;
}

export function FloatingReward({
  show,
  value,
  label = "G",
  type = "growth",
  onComplete,
}: FloatingRewardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const iconConfig = {
    growth: { icon: Sparkles, color: "text-amber-400", bg: "from-amber-400/20 to-amber-400/5" },
    streak: { icon: Flame, color: "text-orange-400", bg: "from-orange-400/20 to-orange-400/5" },
    achievement: { icon: Star, color: "text-yellow-400", bg: "from-yellow-400/20 to-yellow-400/5" },
  };

  const config = iconConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: -60, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-b ${config.bg} border border-white/10 backdrop-blur-md shadow-2xl`}>
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.3 }}
            >
              <Icon size={32} className={config.color} />
            </motion.div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${config.color}`}>
                +{value}
              </span>
              <span className="text-sm text-slate-400">{label}</span>
            </div>
            {type === "streak" && (
              <div className="text-xs text-orange-300 font-medium">
                连续打卡 {value} 天
              </div>
            )}
          </div>

          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 0,
                x: Math.cos((i * Math.PI) / 3) * 60,
                y: Math.sin((i * Math.PI) / 3) * 60 - 30,
              }}
              transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
              style={{
                backgroundColor: type === "growth" ? "#fbbf24" : type === "streak" ? "#fb923c" : "#facc15",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useStreak() {
  const [streak, setStreak] = React.useState(() => {
    const stored = localStorage.getItem("momentum_streak");
    const lastDate = localStorage.getItem("momentum_last_checkin");
    if (!stored || !lastDate) return 0;

    const today = new Date().toISOString().split("T")[0];
    const last = new Date(lastDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return parseInt(stored);
    if (diffDays === 1) return parseInt(stored);
    return 0;
  });

  const checkIn = () => {
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem("momentum_last_checkin");

    let newStreak = streak;
    if (!lastDate) {
      newStreak = 1;
    } else {
      const diffDays = Math.floor(
        (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 0) {
        return { streak, isNew: false };
      } else if (diffDays === 1) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
    }

    setStreak(newStreak);
    localStorage.setItem("momentum_streak", String(newStreak));
    localStorage.setItem("momentum_last_checkin", today);
    return { streak: newStreak, isNew: true };
  };

  const canCheckIn = () => {
    const lastDate = localStorage.getItem("momentum_last_checkin");
    if (!lastDate) return true;
    const today = new Date().toISOString().split("T")[0];
    return lastDate !== today;
  };

  return { streak, checkIn, canCheckIn };
}
