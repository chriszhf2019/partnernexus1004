import React, { memo } from "react";
import { KindnessRecord } from "../types";

interface KindnessCardProps {
  record: KindnessRecord;
  onTriggerRipple: (record: KindnessRecord) => void;
}

const KindnessCard = memo(function KindnessCard({
  record,
  onTriggerRipple,
}: KindnessCardProps) {
  return (
    <div
      onClick={() => onTriggerRipple(record)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTriggerRipple(record);
        }
      }}
      role="button"
      tabIndex={0}
      className="bg-slate-950/20 hover:bg-slate-950/50 border border-slate-900 hover:border-amber-400/30 rounded-xl p-2.5 flex items-start justify-between gap-3 cursor-pointer select-none transition-all group"
      aria-label={`点击播放 ${record.target} 的善意涟漪动画`}
    >
      <div className="flex gap-2.5 items-start">
        <span className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] flex items-center justify-center shrink-0 mt-0.5">
          {record.rippleDepth}
        </span>
        <div>
          <div className="text-slate-300 text-xs font-semibold group-hover:text-amber-300 transition-colors">
            启发 ➔ {record.target}
          </div>
          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
            {record.act}
          </p>
        </div>
      </div>
      <span className="text-[9px] text-slate-600 font-mono shrink-0 mt-0.5">
        播放
      </span>
    </div>
  );
});

export { KindnessCard };
