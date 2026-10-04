import React from "react";

type BadgeVariant =
  | "amber"
  | "sky"
  | "fuchsia"
  | "emerald"
  | "slate"
  | "default"
  | "theme";

interface ZenBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  amber: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  sky: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  fuchsia: "bg-fuchsia-400/10 text-fuchsia-300 border-fuchsia-400/30",
  emerald: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  slate: "bg-slate-800/40 text-slate-400 border-slate-700/50",
  default: "bg-slate-900 text-slate-400 border border-slate-800",
  theme: "badge-theme",
};

export const ZenBadge = React.memo(function ZenBadge({
  children,
  variant = "default",
  className = "",
}: ZenBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
});
