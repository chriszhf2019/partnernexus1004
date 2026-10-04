import React from "react";

interface ZenCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "top" | "left" | "none";
}

export const ZenCard = React.memo(function ZenCard({
  children,
  className = "",
  accent = "none",
}: ZenCardProps) {
  const accentStyles = {
    top: "card-accent-top",
    left: "card-accent-left",
    none: "",
  };

  return (
    <div
      className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md ${accentStyles[accent]} ${className}`}
    >
      {children}
    </div>
  );
});
