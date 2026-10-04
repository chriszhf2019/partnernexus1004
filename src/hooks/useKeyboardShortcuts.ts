import { useEffect, useCallback } from "react";

export interface ShortcutConfig {
  key: string;
  description: string;
  handler: () => void;
  scope?: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  enabled = true
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const keys = shortcut.key.toLowerCase().split("+");
        const mainKey = keys[keys.length - 1];
        const needsCtrl = keys.includes("ctrl");
        const needsMeta = keys.includes("meta");
        const needsShift = keys.includes("shift");
        const needsAlt = keys.includes("alt");

        const hasCtrl = e.ctrlKey;
        const hasMeta = e.metaKey;
        const hasShift = e.shiftKey;
        const hasAlt = e.altKey;

        if (
          e.key.toLowerCase() !== mainKey &&
          e.code.toLowerCase() !== mainKey
        ) {
          continue;
        }

        if (needsCtrl !== hasCtrl) continue;
        if (needsMeta !== hasMeta) continue;
        if (needsShift !== hasShift) continue;
        if (needsAlt !== hasAlt) continue;

        if (
          isTyping &&
          !needsCtrl &&
          !needsMeta &&
          !needsAlt &&
          shortcut.key !== "escape"
        ) {
          continue;
        }

        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        shortcut.handler();
        break;
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
