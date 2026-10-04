import React, { memo } from "react";
import { Achievement, GalaxyNode } from "../types";
import { ZenBadge } from "./ui";

interface AchievementCardProps {
  achievement: Achievement;
  contacts: GalaxyNode[];
}

const AchievementCard = memo(function AchievementCard({
  achievement,
  contacts,
}: AchievementCardProps) {
  const linkedFriends = achievement.linkedFriendIds
    ? achievement.linkedFriendIds
        .map((id) => contacts.find((c) => c.id === id))
        .filter(Boolean) as GalaxyNode[]
    : [];

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex flex-col gap-1.5 hover:border-slate-800 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <ZenBadge variant="default">{achievement.category}</ZenBadge>
          <h4 className="font-sans font-semibold text-slate-200 text-xs">
            {achievement.title}
          </h4>
        </div>
        <span className="text-[9px] text-slate-500 font-mono">
          {achievement.date}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        {achievement.desc}
      </p>
      {linkedFriends.length > 0 && (
        <div className="flex items-center gap-1.5 mt-1 text-[10px]">
          <span className="text-slate-500">共创共鸣星核:</span>
          <div className="flex gap-1">
            {linkedFriends.map((friend) => (
              <span
                key={friend.id}
                className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[9px]"
              >
                {friend.name.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export { AchievementCard };
