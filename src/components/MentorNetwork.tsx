import React, { useState, useMemo } from "react";
import { GalaxyNode } from "../types";
import { Brain, MessageSquare, Calendar, TrendingUp, ChevronDown, ChevronUp, Plus, Check } from "lucide-react";
import { ZenCard, SectionHeader } from "./ui";
import { safeToLocaleDateString } from "../utils/galaxy";

interface MentorNetworkProps {
  contacts: GalaxyNode[];
  onNurtureContact: (id: string) => void;
}

interface MentorSession {
  id: string;
  mentorId: string;
  date: string;
  topic: string;
  keyInsight: string;
}

export function MentorNetwork({ contacts, onNurtureContact }: MentorNetworkProps) {
  const [expandedMentorId, setExpandedMentorId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<MentorSession[]>([
    {
      id: "session-1",
      mentorId: "friend-2",
      date: "2025-06-20",
      topic: "产品架构设计",
      keyInsight: "同心圆模型比线性增长更适合描述个人成长",
    },
  ]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSessionTopic, setNewSessionTopic] = useState("");
  const [newSessionInsight, setNewSessionInsight] = useState("");

  // 获取智囊类型的联系人
  const mentors = useMemo(
    () => contacts.filter((c) => c.type === "智囊"),
    [contacts]
  );

  // 计算导师影响统计
  const mentorStats = useMemo(() => {
    return mentors.map((mentor) => {
      const mentorSessions = sessions.filter((s) => s.mentorId === mentor.id);
      const lastSession = mentorSessions[0];
      const daysSince = lastSession
        ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...mentor,
        sessionCount: mentorSessions.length,
        lastSessionDate: lastSession?.date || null,
        daysSinceLastSession: daysSince,
      };
    });
  }, [mentors, sessions]);

  const handleAddSession = (mentorId: string) => {
    if (!newSessionTopic.trim() || !newSessionInsight.trim()) return;

    const newSession: MentorSession = {
      id: `session-${Date.now()}`,
      mentorId,
      date: new Date().toISOString().split("T")[0],
      topic: newSessionTopic.trim(),
      keyInsight: newSessionInsight.trim(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setNewSessionTopic("");
    setNewSessionInsight("");
    setShowAddSession(false);
  };

  if (mentors.length === 0) {
    return (
      <ZenCard className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
        <SectionHeader
          icon={<Brain size={16} />}
          title="导师网络 (Mentor Network)"
          subtitle="智囊导师是你成长路上的指路明灯"
        />

        <div className="text-center py-8 text-slate-500">
          <Brain size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">还没有导师</p>
          <p className="text-xs mt-1">
            在「人脉星系」中添加类型为「智囊」的联系人
          </p>
        </div>
      </ZenCard>
    );
  }

  return (
    <ZenCard className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
      <SectionHeader
        icon={<Brain size={16} />}
        title="导师网络 (Mentor Network)"
        subtitle={`${mentors.length} 位智囊导师 · ${sessions.length} 次指导记录`}
      />

      <div className="space-y-3 mt-4">
        {mentorStats.map((mentor) => {
          const isExpanded = expandedMentorId === mentor.id;
          const mentorSessions = sessions.filter((s) => s.mentorId === mentor.id);

          return (
            <div
              key={mentor.id}
              className="border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* 导师头部 */}
              <button
                onClick={() => setExpandedMentorId(isExpanded ? null : mentor.id)}
                className="w-full flex items-center justify-between p-3 bg-slate-950/30 hover:bg-slate-950/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                    <Brain size={18} className="text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-slate-200">{mentor.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-amber-400/70">
                        {mentor.sessionCount} 次指导
                      </span>
                      {mentor.daysSinceLastSession !== null && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-[10px] text-slate-500">
                            {mentor.daysSinceLastSession === 0
                              ? "今天"
                              : `${mentor.daysSinceLastSession}天前`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNurtureContact(mentor.id);
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                  >
                    记录互动
                  </button>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500" />
                  )}
                </div>
              </button>

              {/* 展开内容 */}
              {isExpanded && (
                <div className="p-3 bg-slate-950/20 border-t border-slate-800">
                  {/* 指导记录列表 */}
                  {mentorSessions.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {mentorSessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="p-2 bg-slate-900/50 rounded-lg border border-slate-800/50"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={10} className="text-slate-500" />
                            <span className="text-[10px] text-slate-500">
                              {safeToLocaleDateString(session.date, "zh-CN", {
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <h5 className="text-xs font-medium text-slate-200">
                            {session.topic}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {session.keyInsight}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic mb-3">
                      还没有指导记录
                    </p>
                  )}

                  {/* 添加新记录 */}
                  {showAddSession ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newSessionTopic}
                        onChange={(e) => setNewSessionTopic(e.target.value)}
                        placeholder="指导主题..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50"
                      />
                      <textarea
                        value={newSessionInsight}
                        onChange={(e) => setNewSessionInsight(e.target.value)}
                        placeholder="关键洞察..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddSession(false)}
                          className="flex-1 text-xs py-1.5 text-slate-500 hover:text-slate-300"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleAddSession(mentor.id)}
                          className="flex-1 text-xs py-1.5 rounded-lg bg-amber-400 text-slate-950 font-medium hover:bg-amber-300"
                        >
                          保存记录
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddSession(true)}
                      className="w-full text-xs py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600 flex items-center justify-center gap-1"
                    >
                      <Plus size={12} />
                      添加指导记录
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ZenCard>
  );
}
