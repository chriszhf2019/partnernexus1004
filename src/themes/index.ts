export type ThemeName = "amber" | "ocean" | "bamboo";

export interface ThemeCSSVars {
  "--theme-primary": string;
  "--theme-primary-light": string;
  "--theme-primary-dark": string;
  "--theme-fg": string;
  "--theme-glow": string;
  "--theme-accent-bg": string;
  "--theme-accent-border": string;
  "--theme-accent-text": string;
}

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  description: string;
  color: string;
  cssVars: ThemeCSSVars;
}

export const themes: Record<ThemeName, ThemeConfig> = {
  amber: {
    name: "amber",
    label: "晨曦金",
    description: "温暖晨曦，生长绽放",
    color: "#fbbf24",
    cssVars: {
      "--theme-primary": "#fbbf24",
      "--theme-primary-light": "#fcd34d",
      "--theme-primary-dark": "#d97706",
      "--theme-fg": "#020617",
      "--theme-glow": "rgba(251, 191, 36, 0.2)",
      "--theme-accent-bg": "rgba(251, 191, 36, 0.1)",
      "--theme-accent-border": "rgba(251, 191, 36, 0.3)",
      "--theme-accent-text": "#fcd34d",
    },
  },
  ocean: {
    name: "ocean",
    label: "深夜蓝",
    description: "深邃星海，宁静致远",
    color: "#38bdf8",
    cssVars: {
      "--theme-primary": "#38bdf8",
      "--theme-primary-light": "#7dd3fc",
      "--theme-primary-dark": "#0284c7",
      "--theme-fg": "#020617",
      "--theme-glow": "rgba(56, 189, 248, 0.2)",
      "--theme-accent-bg": "rgba(56, 189, 248, 0.1)",
      "--theme-accent-border": "rgba(56, 189, 248, 0.3)",
      "--theme-accent-text": "#7dd3fc",
    },
  },
  bamboo: {
    name: "bamboo",
    label: "竹林绿",
    description: "翠竹清韵，生机盎然",
    color: "#34d399",
    cssVars: {
      "--theme-primary": "#34d399",
      "--theme-primary-light": "#6ee7b7",
      "--theme-primary-dark": "#059669",
      "--theme-fg": "#020617",
      "--theme-glow": "rgba(52, 211, 153, 0.2)",
      "--theme-accent-bg": "rgba(52, 211, 153, 0.1)",
      "--theme-accent-border": "rgba(52, 211, 153, 0.3)",
      "--theme-accent-text": "#6ee7b7",
    },
  },
};

export const themeList = Object.values(themes);
