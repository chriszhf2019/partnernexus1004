import { useCallback, useRef } from "react";

type BreathPhase = "吸气" | "静止" | "呼气";

export function useZenSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  const playZenBell = useCallback(
    (phase: BreathPhase) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        let baseFreq = 136.1;
        if (phase === "吸气") {
          baseFreq = 220.0;
        } else if (phase === "呼气") {
          baseFreq = 110.0;
        } else {
          baseFreq = 165.0;
        }

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.value = baseFreq;
        osc1.detune.value = -3;

        osc2.type = "sine";
        osc2.frequency.value = baseFreq * 2;
        osc2.detune.value = 4;

        osc3.type = "sine";
        osc3.frequency.value = baseFreq * 3;
        osc3.detune.value = -1;

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 2.8
        );

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc3.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc3.start();

        osc1.stop(ctx.currentTime + 3.0);
        osc2.stop(ctx.currentTime + 3.0);
        osc3.stop(ctx.currentTime + 3.0);
      } catch (e) {
        console.warn(
          "Web Audio API was blocked or not supported by browser security constraints:",
          e
        );
      }
    },
    [getAudioContext]
  );

  return { playZenBell };
}
