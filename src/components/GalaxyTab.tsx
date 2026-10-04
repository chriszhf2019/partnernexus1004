import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { GalaxyNode, MeetSource } from "../types";
import NetworkGalaxyVisualizer from "./NetworkGalaxyVisualizer";
import { MentorNetwork } from "./MentorNetwork";
import {
  getDimmingContacts,
  getDaysSinceInteraction,
  groupContactsByDay,
  groupContactsByWeek,
  getSourceStats,
  getNewThisWeek,
  getNewThisMonth,
  getDaysSinceMet,
} from "../utils";
import {
  AlertCircle,
  TrendingUp,
  Users,
  Heart,
  Network,
  UserPlus,
  MessageCircle,
  Handshake,
  Calendar,
  MapPin,
  Clock,
  PieChart,
  List,
  CalendarDays,
} from "lucide-react";
import { ZenCard, ZenButton, ZenInput } from "./ui";

interface GalaxyTabProps {
  contacts: GalaxyNode[];
  setContacts: React.Dispatch<React.SetStateAction<GalaxyNode[]>>;
}

export function GalaxyTab({ contacts, setContacts }: GalaxyTabProps) {
  const [newContactName, setNewContactName] = useState("");
  const [newContactType, setNewContactType] = useState<GalaxyNode["type"]>("灵感");
  const [newContactSource, setNewContactSource] = useState<MeetSource>("其他");
  const [newContactMetDate, setNewContactMetDate] = useState(new Date().toISOString().split("T")[0]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const newContact: GalaxyNode = {
      id: `friend-${Date.now()}`,
      name: newContactName.trim(),
      type: newContactType,
      lastInteractionDate: new Date().toISOString().split("T")[0],
      sharedRipplesCount: 0,
      resonancePulse: false,
      resonanceFrequency: "月",
      introducerId: null,
      introducerName: null,
      firstMetDate: newContactMetDate,
      meetSource: newContactSource,
    };
    setContacts((prev) => [...prev, newContact]);
    setNewContactName("");
  };

  const handleNurtureContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            lastInteractionDate: new Date().toISOString().split("T")[0],
            resonancePulse: false,
            sharedRipplesCount: c.sharedRipplesCount + 1,
          };
        }
        return c;
      })
    );
  };

  // 为NetworkGalaxyVisualizer适配的添加联系人函数
  const handleAddContactFromVisualizer = (contactData: Omit<GalaxyNode, "id">) => {
    const newContact: GalaxyNode = {
      ...contactData,
      id: `friend-${Date.now()}`,
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const pulsatingCount = contacts.filter((c) => c.resonancePulse).length;

  const dimmingContacts = useMemo(() => getDimmingContacts(contacts), [contacts]);

  // 计算关系网络统计
  const networkStats = useMemo(() => {
    const totalRipples = contacts.reduce((sum, c) => sum + c.sharedRipplesCount, 0);
    const avgRipples = contacts.length > 0 ? Math.round(totalRipples / contacts.length) : 0;

    const typeWeights: Record<string, number> = { "智囊": 1.5, "战友": 1.2, "灵感": 1.0, "后浪": 0.8 };
    const impactScore = contacts.reduce((sum, c) => {
      const weight = typeWeights[c.type as keyof typeof typeWeights] || 1;
      return sum + (c.sharedRipplesCount * weight);
    }, 0);

    const healthyCount = contacts.filter((c) => {
      const days = getDaysSinceInteraction(c.lastInteractionDate);
      const threshold = c.resonanceFrequency === "周" ? 7 : c.resonanceFrequency === "月" ? 30 : c.resonanceFrequency === "季" ? 90 : 365;
      return days <= threshold;
    }).length;
    const healthRate = contacts.length > 0 ? Math.round((healthyCount / contacts.length) * 100) : 0;

    return {
      totalRipples,
      avgRipples,
      impactScore: Math.round(impactScore),
      healthRate,
      totalContacts: contacts.length,
      newThisWeek: getNewThisWeek(contacts),
      newThisMonth: getNewThisMonth(contacts),
    };
  }, [contacts]);

  // 时间线分组
  const dayGroups = useMemo(() => groupContactsByDay(contacts), [contacts]);
  const weekGroups = useMemo(() => groupContactsByWeek(contacts), [contacts]);
  const sourceStats = useMemo(() => getSourceStats(contacts), [contacts]);

  // 时间线视图模式
  const [timelineMode, setTimelineMode] = useState<"day" | "week">("day");

  return (
    <motion.div
      key="tab-web"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Intro summary */}
      <div className="bg-slate-900/30 p-4 border border-slate-900 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-medium text-slate-200 text-sm">
            人脉星系系统 (Network CRM)
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            追踪你的人脉关系，记录每一次深度交流，建立属于你的成长网络。
          </p>
        </div>
        {/* 网络统计面板 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 shrink-0">
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <Users size={10} />
              <span>人脉节点</span>
            </div>
            <div className="text-amber-400 font-mono font-bold text-sm">
              {networkStats.totalContacts}
            </div>
          </div>
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <TrendingUp size={10} />
              <span>影响指数</span>
            </div>
            <div className="text-amber-400 font-mono font-bold text-sm">
              +{networkStats.impactScore}
            </div>
          </div>
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <Heart size={10} />
              <span>健康度</span>
            </div>
            <div className={"font-mono font-bold text-sm " + (networkStats.healthRate >= 70 ? 'text-emerald-400' : networkStats.healthRate >= 40 ? 'text-amber-400' : 'text-orange-400')}>
              {networkStats.healthRate}%
            </div>
          </div>
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <Network size={10} />
              <span>共鸣次数</span>
            </div>
            <div className="text-amber-400 font-mono font-bold text-sm">
              {networkStats.avgRipples}
            </div>
          </div>
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <CalendarDays size={10} />
              <span>本周新识</span>
            </div>
            <div className="text-emerald-400 font-mono font-bold text-sm">
              +{networkStats.newThisWeek}
            </div>
          </div>
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <Clock size={10} />
              <span>本月新识</span>
            </div>
            <div className="text-sky-400 font-mono font-bold text-sm">
              +{networkStats.newThisMonth}
            </div>
          </div>
        </div>
      </div>

      {/* 添加联系人表单 */}
      <form
        id="contact-input-area"
        onSubmit={handleAddContact}
        className="flex flex-col gap-3 p-4 bg-slate-900/30 border border-slate-800 rounded-2xl"
      >
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <UserPlus size={16} className="text-amber-400" />
          <span>添加新人脉节点</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <ZenInput
            type="text"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            placeholder="输入联系人姓名..."
            className="flex-1"
          />
          <select
            value={newContactType}
            onChange={(e) => setNewContactType(e.target.value as GalaxyNode["type"])}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none text-sm"
          >
            <option value="智囊">智囊</option>
            <option value="战友">战友</option>
            <option value="灵感">灵感</option>
            <option value="后浪">后浪</option>
          </select>
          <select
            value={newContactSource}
            onChange={(e) => setNewContactSource(e.target.value as MeetSource)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none text-sm"
          >
            <option value="活动">活动</option>
            <option value="社群">社群</option>
            <option value="工作">工作</option>
            <option value="引荐">引荐</option>
            <option value="随机">随机</option>
            <option value="其他">其他</option>
          </select>
          <input
            type="date"
            value={newContactMetDate}
            onChange={(e) => setNewContactMetDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none text-sm"
          />
          <ZenButton type="submit" size="md">
            添加
          </ZenButton>
        </div>
      </form>

      {/* Dimming Stars Reminder */}
      {dimmingContacts.length > 0 && (
        <ZenCard accent="left" className="border-orange-500/30">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-400/10 border border-orange-400/30 flex items-center justify-center shrink-0 text-orange-300">
              <AlertCircle size={16} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-200 mb-1">
                关系需要滋养
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                有 {dimmingContacts.length} 位重要的人已经超过建议的联系周期，记得抽时间深度交流。
              </p>
              <div className="flex flex-wrap gap-2">
                {dimmingContacts.slice(0, 5).map((contact) => {
                  const days = getDaysSinceInteraction(contact.lastInteractionDate);
                  return (
                    <button
                      key={contact.id}
                      onClick={() => handleNurtureContact(contact.id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-orange-500/20 hover:border-orange-400/40 hover:bg-orange-500/5 transition-all group text-[11px]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                      <span className="text-slate-300 group-hover:text-orange-200">
                        {contact.name}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {days}天未联系
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ZenCard>
      )}

      {/* 初识时间线 + 来源分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 初识时间线 */}
        <ZenCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center">
                <Clock size={16} className="text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-200">初识时间线</h3>
            </div>
            <div className="flex gap-1 bg-slate-950/50 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setTimelineMode("day")}
                className={timelineMode === "day" ? "text-[10px] px-2 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30" : "text-[10px] px-2 py-1 rounded-md text-slate-500 hover:text-slate-300"}
              >
                按日
              </button>
              <button
                onClick={() => setTimelineMode("week")}
                className={timelineMode === "week" ? "text-[10px] px-2 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30" : "text-[10px] px-2 py-1 rounded-md text-slate-500 hover:text-slate-300"}
              >
                按周
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {(timelineMode === "day" ? dayGroups : weekGroups).map((group) => (
              <div key={group.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="w-px flex-1 bg-slate-800 mt-1" />
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-300">{group.label}</span>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded-full">
                      {group.count} 人
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.contacts.map((c) => {
                      const typeColor =
                        c.type === "智囊"
                          ? "bg-amber-400"
                          : c.type === "战友"
                          ? "bg-sky-400"
                          : c.type === "灵感"
                          ? "bg-fuchsia-400"
                          : "bg-emerald-400";
                      return (
                        <div
                          key={c.id}
                          className="px-2 py-1 bg-slate-950/50 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5"
                        >
                          <span className={"w-1.5 h-1.5 rounded-full " + typeColor} />
                          {c.name.split(" ")[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {(timelineMode === "day" ? dayGroups : weekGroups).length === 0 && (
              <div className="text-center py-6 text-slate-600 text-xs italic">
                还没有认识的人
              </div>
            )}
          </div>
        </ZenCard>

        {/* 来源分布 */}
        <ZenCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-fuchsia-400/10 flex items-center justify-center">
              <PieChart size={16} className="text-fuchsia-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-200">来源分布</h3>
          </div>

          <div className="space-y-3">
            {/* 可视化环形图（纯 CSS 进度条形式） */}
            <div className="space-y-2.5">
              {sourceStats.map((stat) => {
                const colorMap: Record<MeetSource, string> = {
                  活动: "bg-amber-400",
                  社群: "bg-sky-400",
                  工作: "bg-emerald-400",
                  引荐: "bg-fuchsia-400",
                  随机: "bg-orange-400",
                  其他: "bg-slate-500",
                };
                return (
                  <div key={stat.source}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={"w-2 h-2 rounded-full " + colorMap[stat.source]} />
                        <span className="text-xs text-slate-300">{stat.source}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {stat.count} 人 · {stat.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={"h-full rounded-full " + colorMap[stat.source] + " transition-all duration-500"}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {sourceStats.length === 0 && (
              <div className="text-center py-6 text-slate-600 text-xs italic">
                暂无来源数据
              </div>
            )}
          </div>
        </ZenCard>
      </div>

      {/* 关系追踪面板 */}
      <ZenCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center">
            <Handshake size={16} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-200">关系追踪</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 我帮助过的人 */}
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={14} className="text-amber-400" />
              <span className="text-xs text-slate-400">我帮助过的人</span>
            </div>
            <div className="space-y-2">
              {contacts
                .filter((c) => c.sharedRipplesCount > 0)
                .sort((a, b) => b.sharedRipplesCount - a.sharedRipplesCount)
                .slice(0, 4)
                .map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-slate-300">{contact.name}</span>
                    </div>
                    <span className="text-amber-400 font-mono">{contact.sharedRipplesCount}次</span>
                  </div>
                ))}
              {contacts.filter((c) => c.sharedRipplesCount > 0).length === 0 && (
                <div className="text-[11px] text-slate-500 italic">暂无记录</div>
              )}
            </div>
          </div>

          {/* 最近联系的人 */}
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-blue-400" />
              <span className="text-xs text-slate-400">最近联系</span>
            </div>
            <div className="space-y-2">
              {[...contacts]
                .sort((a, b) => {
                  const dateA = new Date(a.lastInteractionDate);
                  const dateB = new Date(b.lastInteractionDate);
                  const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
                  const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
                  return timeB - timeA;
                })
                .slice(0, 4)
                .map((contact) => {
                  const days = getDaysSinceInteraction(contact.lastInteractionDate);
                  return (
                    <div key={contact.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={"w-1.5 h-1.5 rounded-full " + (days <= 7 ? "bg-emerald-400" : days <= 30 ? "bg-amber-400" : "bg-orange-400")} />
                        <span className="text-slate-300">{contact.name}</span>
                      </div>
                      <span className="text-slate-500 font-mono">{days}天前</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </ZenCard>

      {/* 导师网络面板 */}
      <MentorNetwork
        contacts={contacts}
        onNurtureContact={handleNurtureContact}
      />

      {/* Star constellation map visualizer */}
      <NetworkGalaxyVisualizer
        contacts={contacts}
        onAddContact={handleAddContactFromVisualizer}
        onNurtureContact={handleNurtureContact}
      />
    </motion.div>
  );
}
