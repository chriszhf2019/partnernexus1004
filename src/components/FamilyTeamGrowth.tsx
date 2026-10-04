import React, { useState, useMemo } from "react";
import { Heart, Trophy, Target, Users, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { ZenCard, SectionHeader } from "./ui";
import { safeToLocaleDateString } from "../utils/galaxy";

interface FamilyMember {
  id: string;
  name: string;
  role: "父母" | "配偶" | "子女" | "兄弟姐妹" | "团队成员";
  contribution: number;
  lastActivity: string;
}

interface SharedGoal {
  id: string;
  title: string;
  progress: number;
  members: string[];
  deadline?: string;
  completed: boolean;
}

interface SharedGrowth {
  id: string;
  title: string;
  date: string;
  description: string;
  sharedBy: string[];
}

interface FamilyTeamGrowthProps {
  // 可以后续扩展传入实际数据
  members?: FamilyMember[];
  goals?: SharedGoal[];
  growths?: SharedGrowth[];
}

export function FamilyTeamGrowth({
  members = [
    { id: "m1", name: "爸爸", role: "父母", contribution: 85, lastActivity: "2025-06-20" },
    { id: "m2", name: "妈妈", role: "父母", contribution: 72, lastActivity: "2025-06-19" },
    { id: "m3", name: "小华", role: "子女", contribution: 45, lastActivity: "2025-06-21" },
  ],
  goals = [
    { id: "g1", title: "家庭每周运动计划", progress: 60, members: ["m1", "m2", "m3"], deadline: "2025-06-30", completed: false },
    { id: "g2", title: "一起读完《原子习惯》", progress: 100, members: ["m1", "m2"], completed: true },
  ],
  growths = [
    { id: "s1", title: "家庭徒步旅行", date: "2025-06-15", description: "周末一起去爬山，增进了彼此的体能和感情", sharedBy: ["m1", "m2", "m3"] },
    { id: "s2", title: "小华学会游泳", date: "2025-06-10", description: "在爸爸的指导下，小华终于学会了蛙泳", sharedBy: ["m1", "m3"] },
  ],
}: FamilyTeamGrowthProps) {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const totalContribution = useMemo(
    () => members.reduce((sum, m) => sum + m.contribution, 0),
    [members]
  );

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  const getRoleIcon = (role: FamilyMember["role"]) => {
    switch (role) {
      case "父母": return "👨‍👩‍👧";
      case "配偶": return "💑";
      case "子女": return "👶";
      case "兄弟姐妹": return "👫";
      case "团队成员": return "👥";
      default: return "👤";
    }
  };

  return (
    <ZenCard className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
      <SectionHeader
        icon={<Heart size={16} />}
        title="家庭/团队成长"
        subtitle={`${members.length} 位成员 · ${activeGoals.length} 个共同目标`}
      />

      {/* 成员贡献概览 */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-2 bg-slate-950/40 rounded-lg border border-slate-800 text-center"
          >
            <div className="text-lg mb-1">{getRoleIcon(member.role)}</div>
            <div className="text-xs font-medium text-slate-200 truncate">{member.name}</div>
            <div className="text-[10px] text-amber-400 font-mono">{member.contribution} G</div>
          </div>
        ))}
      </div>

      {/* 共同目标 */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Target size={12} className="text-emerald-400" />
            共同目标
          </h4>
          <button className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5">
            <Plus size={10} />
            添加目标
          </button>
        </div>

        <div className="space-y-2">
          {activeGoals.map((goal) => {
            const isExpanded = expandedGoalId === goal.id;
            const goalMembers = members.filter((m) => goal.members.includes(m.id));

            return (
              <div
                key={goal.id}
                className="border border-slate-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-950/30 hover:bg-slate-950/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
                      <Target size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-xs text-slate-200">{goal.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-mono">{goal.progress}%</span>
                    {isExpanded ? (
                      <ChevronUp size={12} className="text-slate-500" />
                    ) : (
                      <ChevronDown size={12} className="text-slate-500" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-2.5 bg-slate-950/20 border-t border-slate-800">
                    <div className="mb-2">
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>参与者: {goalMembers.map((m) => m.name).join(", ")}</span>
                      {goal.deadline && <span>截止: {goal.deadline}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 共同成长时刻 */}
      <div className="mt-4">
        <h4 className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-2">
          <Trophy size={12} className="text-amber-400" />
          共同成长时刻
        </h4>

        <div className="space-y-2">
          {growths.map((growth) => {
            const growthMembers = members.filter((m) => growth.sharedBy.includes(m.id));

            return (
              <div
                key={growth.id}
                className="p-2.5 bg-slate-950/30 rounded-lg border border-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-medium text-slate-200">{growth.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      {growth.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {growthMembers.map((m) => (
                        <span
                          key={m.id}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-600 flex-shrink-0">
                    {safeToLocaleDateString(growth.date, "zh-CN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 空状态提示 */}
      {members.length === 0 && (
        <div className="text-center py-6 text-slate-500">
          <Users size={24} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs">还没有家庭或团队成员</p>
          <p className="text-[10px] mt-1">添加成员开始共同成长之旅</p>
        </div>
      )}
    </ZenCard>
  );
}
