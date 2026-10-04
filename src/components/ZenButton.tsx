import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ZenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "btn-theme-primary",
  secondary:
    "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
  ghost:
    "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200",
  outline:
    "bg-transparent border border-slate-700 hover:border-theme hover:bg-theme-accent text-slate-300 hover:text-theme-accent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 min-h-[36px] text-xs rounded-lg",
  md: "px-4 py-2 min-h-[44px] text-xs rounded-xl",
  lg: "px-5 py-2.5 min-h-[48px] text-sm rounded-xl",
};

export const ZenButton = React.memo(function ZenButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ZenButtonProps) {
  return (
    <button
      className={`flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
});
