import React, { createContext, useContext, useCallback, useMemo, useEffect } from "react";
import { ThemeName, ThemeConfig, themes } from "../themes";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface ThemeContextValue {
  theme: ThemeConfig;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "momentum_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useLocalStorage<ThemeName>(
    THEME_STORAGE_KEY,
    "amber"
  );

  const theme = useMemo(() => themes[themeName], [themeName]);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  const setTheme = useCallback(
    (name: ThemeName) => {
      setThemeName(name);
    },
    [setThemeName]
  );

  const cycleTheme = useCallback(() => {
    const themeOrder: ThemeName[] = ["amber", "ocean", "bamboo"];
    const currentIndex = themeOrder.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setThemeName(themeOrder[nextIndex]);
  }, [themeName, setThemeName]);

  const value = useMemo(
    () => ({
      theme,
      themeName,
      setTheme,
      cycleTheme,
    }),
    [theme, themeName, setTheme, cycleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
