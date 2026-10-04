import { useState, useEffect, useCallback } from "react";
import { useZenSound } from "./useZenSound";

type BreathPhase = "吸气" | "静止" | "呼气";

export function useBreathing(soundEnabled: boolean) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("吸气");
  const [breathSeconds, setBreathSeconds] = useState(4);
  const { playZenBell } = useZenSound();

  const getNextPhase = useCallback((current: BreathPhase): BreathPhase => {
    if (current === "吸气") return "静止";
    if (current === "静止") return "呼气";
    return "吸气";
  }, []);

  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          setBreathPhase((current) => {
            const nextPhase = getNextPhase(current);
            if (soundEnabled) {
              playZenBell(nextPhase);
            }
            return nextPhase;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(breathInterval);
  }, [soundEnabled, getNextPhase, playZenBell]);

  return { breathPhase, breathSeconds };
}
