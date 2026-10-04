import React, { useState, useMemo } from "react";
import { Sparkles, Milestone, Award, CheckCircle, Clock, TrendingUp, Users } from "lucide-react";
import { ZenCard } from "./ui";
import { WeeklySeed, GalaxyNode } from "../types";

interface SkillInvestmentProps {
  seeds: WeeklySeed[];
  contacts: GalaxyNode[];
}

interface SkillItem {
  name: string;
  category: "智慧" | "创造" | "连结" | "心性" | "体魄";
  weight: number;
  hours: number;
  growthG: number;
  impacts: number;
  contributions: string[];
}

const BASE_SKILLS: SkillItem[] = [
  {
    name: "产品设计",
    category: "创造",
    weight: 1.5,
    hours: 42,
    growthG: 25,
    impacts: 12,
    contributions: [
      "独立重写了 Momentum 核心中圆星系引力传递拓扑图算法",
      "解决了 SVG 多级嵌套下呼吸圆环重叠渲染的性能问题",
      "通过 Radial Tree concentric sectors 布局完美规划了星群",
    ],
  },
  {
    name: "TypeScript",
    category: "智慧",
    weight: 1.3,
    hours: 28,
    growthG: 18,
    impacts: 8,
    contributions: [
      "在 React 架构中深度制定了安全的 State-Driven 状态流",
      "使用严格的 TS 约束，编写了符合 Digital Zen 美学的类型实体",
    ],
  },
  {
    name: "视觉规范",
    category: "创造",
    weight: 1.4,
    hours: 35,
    growthG: 20,
    impacts: 10,
    contributions: [
      "推翻所有常规倒计时，改用‘动能’与‘绽放节点’重构主视觉",
      "确立‘晨曦金’与‘深邃蓝’的高灵能微粒流配色",
    ],
  },
  {
    name: "深度沟通",
    category: "连结",
    weight: 1.2,
    hours: 20,
    growthG: 15,
    impacts: 15,
    contributions: [
      "与张教授、李战一完成深度技术合作探讨",
      "通过建立引力溯源谱系，发掘出人脉裂变引力传递路径",
    ],
  },
  {
    name: "正念冥想",
    category: "心性",
    weight: 1.1,
    hours: 15,
    growthG: 12,
    impacts: 3,
    contributions: [
      "完成每日 15 分钟清晨定境专注练习，极大程度过滤工作焦虑",
      "写下关于《静默力量：在无声中向下扎根》的深度复利沉淀",
    ],
  },
  {
    name: "云运维",
    category: "智慧",
    weight: 1.0,
    hours: 12,
    growthG: 8,
    impacts: 6,
    contributions: [
      "辅助后浪陈小新配置自建 Docker 隔离服务端，打通全流程",
    ],
  },
  {
    name: "成长理论",
    category: "心性",
    weight: 1.25,
    hours: 18,
    growthG: 15,
    impacts: 5,
    contributions: [
      "构建同心圆生长模型，发表于设计研讨会沙龙",
    ],
  },
];

export default function SkillInvestmentMap({ seeds, contacts }: SkillInvestmentProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>("产品设计");

  // 根据种子数据动态计算技能
  const skills = useMemo(() => {
    return BASE_SKILLS.map((skill) => {
      // 相关种子数量
      const relatedSeeds = seeds.filter((s) => s.category === skill.category);
      const bloomSeeds = relatedSeeds.filter((s) => s.status === "绽放").length;
      const growingSeeds = relatedSeeds.filter((s) => s.status === "生长").length;

      // 相关联系人
      const relatedContacts = contacts.filter((c) => {
        if (skill.category === "连结") return true;
        if (skill.category === "智慧") return c.type === "智囊" || c.type === "后浪";
        if (skill.category === "创造") return c.type === "战友" || c.type === "灵感";
        return false;
      });

      const dynamicGrowth = bloomSeeds * 15 + growingSeeds * 8;
      const dynamicImpacts = relatedContacts.reduce((sum, c) => sum + c.sharedRipplesCount, 0);

      return {
        ...skill,
        growthG: Math.max(skill.growthG, dynamicGrowth),
        impacts: Math.max(skill.impacts, dynamicImpacts),
        weight: Math.max(
          skill.weight,
          1 + (dynamicGrowth + dynamicImpacts * 2) / 50
        ),
      };
    });
  }, [seeds, contacts]);

  const activeSkill = skills.find((s) => s.name === selectedSkill) || skills[0];

  const getCategoryStyles = (category: string, isSelected: boolean) => {
    switch (category) {
      case "智慧":
        return isSelected
          ? "bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/20"
          : "bg-amber-400/10 text-amber-300 border-amber-400/20 hover:border-amber-400/50";
      case "创造":
        return isSelected
          ? "bg-sky-400 text-slate-950 border-sky-300 shadow-sky-500/20"
          : "bg-sky-400/10 text-sky-300 border-sky-400/20 hover:border-sky-400/50";
      case "连结":
        return isSelected
          ? "bg-fuchsia-400 text-slate-950 border-fuchsia-300 shadow-fuchsia-500/20"
          : "bg-fuchsia-400/10 text-fuchsia-300 border-fuchsia-400/20 hover:border-fuchsia-400/50";
      case "心性":
        return isSelected
          ? "bg-emerald-400 text-slate-950 border-emerald-300 shadow-emerald-500/20"
          : "bg-emerald-400/10 text-emerald-300 border-emerald-400/20 hover:border-emerald-400/50";
      default:
        return isSelected
          ? "bg-slate-400 text-slate-950 border-slate-300 shadow-slate-500/20"
          : "bg-slate-400/10 text-slate-300 border-slate-400/20 hover:border-slate-400/50";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "智慧":
        return { text: "text-amber-400", bg: "bg-amber-400", light: "bg-amber-400/10" };
      case "创造":
        return { text: "text-sky-400", bg: "bg-sky-400", light: "bg-sky-400/10" };
      case "连结":
        return { text: "text-fuchsia-400", bg: "bg-fuchsia-400", light: "bg-fuchsia-400/10" };
      case "心性":
        return { text: "text-emerald-400", bg: "bg-emerald-400", light: "bg-emerald-400/10" };
      default:
        return { text: "text-slate-400", bg: "bg-slate-400", light: "bg-slate-400/10" };
    }
  };

  const colors = getCategoryColor(activeSkill.category);

  return (
    <div id="skill-investment-container" className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
      {/* 技能投资图 (左侧) */}
      <div className="md:col-span-7">
        <ZenCard className="h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Milestone size={16} className="text-amber-300" />
            <h3 className="font-sans font-medium tracking-wide text-slate-200 text-sm">
              技能投资图 (Skill Investment)
            </h3>
          </div>

          {/* 技能标签云 */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center p-4 sm:p-6 bg-slate-950/40 rounded-xl border border-slate-950/80 min-h-[140px] sm:min-h-[180px]">
            {skills.map((skill) => {
              const isSelected = selectedSkill === skill.name;
              const sizeClass =
                skill.weight > 1.4
                  ? "text-sm font-semibold px-4 py-2"
                  : skill.weight > 1.2
                  ? "text-xs font-medium px-3 py-1.5"
                  : "text-[11px] px-2.5 py-1";

              return (
                <button
                  key={skill.name}
                  onClick={() => setSelectedSkill(skill.name)}
                  className={`rounded-full border transition-all duration-300 cursor-pointer text-center ${sizeClass} ${getCategoryStyles(
                    skill.category,
                    isSelected
                  )} ${isSelected ? "shadow-md scale-105" : "hover:scale-102"}`}
                >
                  <span className="flex items-center gap-1.5 justify-center">
                    {isSelected && <Sparkles size={11} />}
                    {skill.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 三指标概览 */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 sm:p-3 bg-slate-950/50 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock size={12} className="text-blue-400" />
                <span className="text-[10px] text-slate-500">投入时间</span>
              </div>
              <div className="text-sm font-mono font-bold text-blue-400">{activeSkill.hours}h</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-slate-950/50 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp size={12} className="text-amber-400" />
                <span className="text-[10px] text-slate-500">成长能量</span>
              </div>
              <div className="text-sm font-mono font-bold text-amber-400">+{activeSkill.growthG}G</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-slate-950/50 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users size={12} className="text-purple-400" />
                <span className="text-[10px] text-slate-500">影响人数</span>
              </div>
              <div className="text-sm font-mono font-bold text-purple-400">{activeSkill.impacts}</div>
            </div>
          </div>
        </ZenCard>
      </div>

      {/* 技能详情 (右侧) */}
      <div className="md:col-span-5">
        <ZenCard className="h-full flex flex-col">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-500 font-mono">技能投资详情</span>
                <h4 className="font-sans font-semibold text-slate-200 text-base mt-0.5">
                  {activeSkill.name}
                </h4>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded border ${colors.light} ${colors.text}`}
              >
                {activeSkill.category}
              </span>
            </div>

            {/* 进度条可视化 */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-500">投入时间</span>
                  <span className="text-blue-400 font-mono">{activeSkill.hours} 小时</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${Math.min(100, (activeSkill.hours / 50) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-500">成长能量</span>
                  <span className="text-amber-400 font-mono">+{activeSkill.growthG} G</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, (activeSkill.growthG / 30) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-slate-500">影响次数</span>
                  <span className="text-purple-400 font-mono">{activeSkill.impacts} 次</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${Math.min(100, (activeSkill.impacts / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 贡献记录 */}
            <div className="text-xs">
              <div className="text-slate-400 font-medium mb-2 flex items-center gap-1.5">
                <Award size={13} className="text-amber-300" />
                <span>成长印记 (Contribution Logs)</span>
              </div>
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                {activeSkill.contributions.map((log, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start text-slate-300 leading-relaxed text-[11px] bg-slate-950/20 p-2 rounded-lg border border-slate-800/40"
                  >
                    <CheckCircle size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-800/80 pt-3">
            "每一项技能都是一项长期投资，时间会给出复利的答案。"
          </div>
        </ZenCard>
      </div>
    </div>
  );
}
