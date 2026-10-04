import React from "react";

interface ZenSkeletonProps {
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

export const ZenSkeleton = React.memo(function ZenSkeleton({
  variant = "text",
  width,
  height,
  className = "",
  lines = 1,
}: ZenSkeletonProps) {
  const baseClass =
    "bg-slate-800/60 rounded-lg overflow-hidden relative";
  const shimmerClass =
    "after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-slate-700/30 after:to-transparent after:animate-[shimmer_2s_infinite]";

  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === "number" ? `${height}px` : height;

  if (variant === "circle") {
    return (
      <div
        className={`${baseClass} ${shimmerClass} rounded-full ${className}`}
        style={{
          width: width ?? 40,
          height: height ?? width ?? 40,
          ...style,
        }}
      />
    );
  }

  if (variant === "rect") {
    return (
      <div
        className={`${baseClass} ${shimmerClass} ${className}`}
        style={style}
      />
    );
  }

  // Text variant - support multiple lines
  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${shimmerClass} h-3`}
            style={{
              width:
                i === lines - 1
                  ? "60%"
                  : typeof width === "number"
                  ? `${width}px`
                  : width ?? "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClass} ${shimmerClass} h-3 ${className}`}
      style={style}
    />
  );
});

interface SkeletonCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function SkeletonCard({ className = "", children }: SkeletonCardProps) {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
