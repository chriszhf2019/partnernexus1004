import React from "react";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader = React.memo(function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-amber-300">{icon}</span>
        <div>
          <h3 className="font-sans font-medium tracking-wide text-slate-200 text-sm">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
});
