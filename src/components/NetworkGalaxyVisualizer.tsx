import React, { useState, useMemo } from "react";
import { GalaxyNode, MeetSource } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Users, Link2, Sparkles, UserPlus, Zap, Check, AlertCircle, Calendar, MapPin, Clock } from "lucide-react";
import { getDimmingLevel } from "../utils/galaxy";

interface NetworkGalaxyVisualizerProps {
  contacts: GalaxyNode[];
  onAddContact: (contact: Omit<GalaxyNode, "id">) => void;
  onNurtureContact: (id: string) => void;
}

export default function NetworkGalaxyVisualizer({
  contacts,
  onAddContact,
  onNurtureContact,
}: NetworkGalaxyVisualizerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("friend-2");
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"智囊" | "战友" | "灵感" | "后浪">("战友");
  const [introducerId, setIntroducerId] = useState<string>("");
  const [resonanceFrequency, setResonanceFrequency] = useState<"周" | "月" | "季" | "年">("月");
  const [meetSource, setMeetSource] = useState<MeetSource>("其他");
  const [firstMetDate, setFirstMetDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d" | "90d" | "1y">("all");

  // 根据时间筛选联系人
  const filteredContacts = useMemo(() => {
    if (timeFilter === "all") return contacts;
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
    const threshold = Date.now() - daysMap[timeFilter] * 24 * 60 * 60 * 1000;
    return contacts.filter((c) => {
      const d = new Date(c.firstMetDate);
      return !isNaN(d.getTime()) && d.getTime() >= threshold;
    });
  }, [contacts, timeFilter]);

  // Simple and highly predictable deterministic layout for nodes based on tree structure.
  // We want to avoid randomized physics loops which can cause flickering.
  const nodePositions = useMemo(() => {
    const width = 500;
    const height = 450;
    const center = { x: width / 2, y: height / 2 };
    
    const positions: Record<string, { x: number; y: number }> = {};
    
    // Step 1: Place central root
    const rootNode = filteredContacts.find(c => c.introducerId === null) || filteredContacts[0];
    if (!rootNode) return positions;
    positions[rootNode.id] = { x: center.x, y: center.y - 10 };

    // Step 2: Categorize by depth
    const levels: Record<string, number> = {};
    const calculateDepth = (nodeId: string): number => {
      if (nodeId === rootNode.id) return 0;
      if (levels[nodeId] !== undefined) return levels[nodeId];
      
      const node = filteredContacts.find(c => c.id === nodeId);
      if (!node || !node.introducerId) return 1;
      
      const depth = calculateDepth(node.introducerId) + 1;
      levels[nodeId] = depth;
      return depth;
    };

    filteredContacts.forEach(c => {
      calculateDepth(c.id);
    });

    // Group nodes by parent
    const childrenMap: Record<string, string[]> = {};
    filteredContacts.forEach(c => {
      if (c.introducerId) {
        if (!childrenMap[c.introducerId]) {
          childrenMap[c.introducerId] = [];
        }
        childrenMap[c.introducerId].push(c.id);
      }
    });

    // Recursively place children in radial concentric sectors
    const placeChildren = (parentId: string, currentAngle: number, angleRange: number, radius: number) => {
      const kids = childrenMap[parentId] || [];
      if (kids.length === 0) return;

      const parentPos = positions[parentId] || center;
      const angleStep = angleRange / (kids.length + 1);

      kids.forEach((kidId, idx) => {
        const angle = currentAngle - angleRange / 2 + angleStep * (idx + 1);
        const kidX = parentPos.x + Math.cos(angle) * radius;
        const kidY = parentPos.y + Math.sin(angle) * radius;
        
        // Clamping to stay within bounds
        positions[kidId] = {
          x: Math.max(50, Math.min(width - 50, kidX)),
          y: Math.max(50, Math.min(height - 50, kidY))
        };

        // Recurse for grandchildren with smaller range & radius
        placeChildren(kidId, angle, Math.PI / 3, radius * 0.8);
      });
    };

    // Kick off child placement around root node in a full circle
    const level1Kids = childrenMap[rootNode.id] || [];
    level1Kids.forEach((kidId, idx) => {
      const angle = (idx * 2 * Math.PI) / level1Kids.length;
      const radius = 110;
      const kidX = center.x + Math.cos(angle) * radius;
      const kidY = center.y + Math.sin(angle) * radius;
      positions[kidId] = { x: kidX, y: kidY };
      
      // Recurse deeper
      placeChildren(kidId, angle, Math.PI / 2, 85);
    });

    return positions;
  }, [filteredContacts]);

  // Selected node
  const selectedNode = contacts.find(c => c.id === selectedNodeId);

  // Compute recommendation path for selected node
  const recommendationPath = useMemo(() => {
    if (!selectedNodeId) return [];
    const path: string[] = [];
    let currentId: string | null = selectedNodeId;
    
    // Safety break for loop
    let depth = 0;
    while (currentId && depth < 20) {
      path.unshift(currentId);
      const node = contacts.find(c => c.id === currentId);
      currentId = node ? node.introducerId : null;
      depth++;
    }
    return path;
  }, [selectedNodeId, contacts]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parentNode = contacts.find(c => c.id === introducerId) || contacts[0];

    onAddContact({
      name: name.trim(),
      type,
      introducerId: parentNode.id,
      introducerName: parentNode.name,
      resonanceFrequency,
      lastInteractionDate: new Date().toISOString().split("T")[0],
      resonancePulse: false,
      sharedRipplesCount: 0,
      firstMetDate,
      meetSource,
    });

    setName("");
    setIntroducerId("");
    setShowAddForm(false);
  };

  const getEnergyColor = (type: string) => {
    switch (type) {
      case "智囊": return "text-amber-300 border-amber-300/30 bg-amber-400/5";
      case "战友": return "text-sky-300 border-sky-300/30 bg-sky-400/5";
      case "灵感": return "text-fuchsia-300 border-fuchsia-300/30 bg-fuchsia-400/5";
      case "后浪": return "text-emerald-300 border-emerald-300/30 bg-emerald-400/5";
      default: return "text-gray-300 border-gray-300/30 bg-gray-400/5";
    }
  };

  const getEnergyGlow = (type: string) => {
    switch (type) {
      case "智囊": return "rgba(245, 158, 11, 0.5)"; // amber
      case "战友": return "rgba(14, 165, 233, 0.5)"; // sky
      case "灵感": return "rgba(217, 70, 239, 0.5)"; // fuchsia
      case "后浪": return "rgba(16, 185, 129, 0.5)"; // emerald
      default: return "rgba(255, 255, 255, 0.5)";
    }
  };

  return (
    <div id="network-galaxy-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      {/* Galaxy Map Canvas (Left) */}
      <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-md">
        
        {/* Absolute Background Starfield Decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="w-full flex items-center justify-between mb-2 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="font-sans font-medium tracking-wide text-slate-200 text-sm">
              人脉星系星云图
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* 时间筛选 */}
            <div className="flex gap-0.5 bg-slate-950/50 rounded-lg p-0.5 border border-slate-800">
              {[
                { key: "all", label: "全部" },
                { key: "7d", label: "7天" },
                { key: "30d", label: "30天" },
                { key: "90d", label: "90天" },
                { key: "1y", label: "1年" },
              ].map((opt) => {
                const isActive = timeFilter === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setTimeFilter(opt.key as any)}
                    className={"text-[9px] px-2 py-1 rounded-md transition-all " + (isActive ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "text-slate-500 hover:text-slate-300")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 hover:border-amber-400/50 hover:bg-amber-400/10 text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
            >
              <UserPlus size={13} />
              <span>引力溯源</span>
            </button>
          </div>
        </div>

        {/* Constellation SVG View */}
        <div className="relative w-full h-[400px] flex items-center justify-center bg-slate-950/40 rounded-xl overflow-hidden border border-slate-900">
          
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 450">
            <defs>
              {/* Star glowing filters */}
              <filter id="glow-star" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-highlight" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* DRAW LINKS: Connecting Lines */}
            {filteredContacts.map((contact) => {
              if (!contact.introducerId) return null;
              const startPos = nodePositions[contact.introducerId];
              const endPos = nodePositions[contact.id];
              if (!startPos || !endPos) return null;

              // Check if this line is part of the highlighted recommendation path
              const isHighlighted = 
                recommendationPath.includes(contact.id) && 
                recommendationPath.includes(contact.introducerId) &&
                recommendationPath.indexOf(contact.id) === recommendationPath.indexOf(contact.introducerId) + 1;

              return (
                <g key={`link-${contact.id}`}>
                  {/* Outer glow line if highlighted */}
                  {isHighlighted && (
                    <line
                      x1={startPos.x}
                      y1={startPos.y}
                      x2={endPos.x}
                      y2={endPos.y}
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeOpacity="0.6"
                      strokeLinecap="round"
                      filter="url(#glow-star)"
                      className="animate-pulse"
                    />
                  )}
                  {/* Basic connection line */}
                  <motion.line
                    x1={startPos.x}
                    y1={startPos.y}
                    x2={endPos.x}
                    y2={endPos.y}
                    stroke={isHighlighted ? "#fbbf24" : "rgba(148, 163, 184, 0.15)"}
                    strokeWidth={isHighlighted ? "1.8" : "1"}
                    strokeDasharray={contact.type === "后浪" ? "3,3" : undefined}
                    transition={{ duration: 0.4 }}
                  />
                </g>
              );
            })}

            {/* DRAW STARS: Nodes */}
            {filteredContacts.map((contact) => {
              const pos = nodePositions[contact.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === contact.id;
              const isRoot = contact.introducerId === null;
              const dimmingLevel = getDimmingLevel(contact);
              
              // Color parameters based on type
              const isPulsating = contact.resonancePulse;
              const glowColor = getEnergyGlow(contact.type);

              const isDimming = dimmingLevel !== "normal";
              const isDim = dimmingLevel === "dim";

              return (
                <g 
                  key={`node-${contact.id}`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNodeId(contact.id)}
                >
                  {/* Dimming alert indicator */}
                  {isDim && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r="18"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="1"
                      strokeOpacity="0.6"
                      strokeDasharray="2,2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                    />
                  )}

                  {/* Concentric Breathing Circle for Resonance alerting */}
                  {isPulsating && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="16"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.2"
                      strokeOpacity="0.7"
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Selection glow ring */}
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="22"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1"
                      strokeOpacity="0.8"
                      filter="url(#glow-highlight)"
                    />
                  )}

                  {/* Star Outer Hover Glow */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "14" : "11"}
                    fill={glowColor}
                    fillOpacity={isSelected ? "0.2" : isDim ? "0.02" : isDimming ? "0.035" : "0.05"}
                    className="group-hover:scale-125 transition-transform duration-300"
                  />

                  {/* Core Star Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isRoot ? "8" : isSelected ? "7.5" : "5.5"}
                    fill={isRoot ? "#fbbf24" : isSelected ? "#fff" : glowColor.replace("0.5", "1")}
                    fillOpacity={isDim ? "0.4" : isDimming ? "0.6" : "1"}
                    filter={isSelected || isRoot ? "url(#glow-star)" : undefined}
                    className={"transition-all duration-300 " + (isDimming ? "animate-pulse" : "")}
                  />

                  {/* Dimming icon overlay */}
                  {isDimming && !isRoot && (
                    <text
                      x={pos.x}
                      y={pos.y + 2}
                      textAnchor="middle"
                      fontSize="6"
                      fill={isDim ? "#f97316" : "#fbbf24"}
                      className="pointer-events-none select-none"
                    >
                      !
                    </text>
                  )}

                  {/* Star text label */}
                  <text
                    x={pos.x}
                    y={pos.y - 14}
                    textAnchor="middle"
                    fill={isSelected ? "#fbbf24" : isDim ? "#64748b" : isDimming ? "#94a3b8" : "#94a3b8"}
                    fontSize="10"
                    fontWeight={isSelected ? "600" : "400"}
                    opacity={isDim ? "0.6" : "1"}
                    className="pointer-events-none select-none transition-all duration-300 font-sans"
                  >
                    {contact.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Legends in canvas corner */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-900 text-[9px] text-slate-400 pointer-events-none max-w-[90%]">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />智囊</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" />战友</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />灵感</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />后浪</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />待共鸣</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-50 animate-pulse" />星光微弱</span>
          </div>

        </div>

        {/* Dynamic quote based on state */}
        <div className="mt-3 text-[11px] text-slate-500 italic text-center leading-relaxed">
          点击星云中闪烁的星辰，查看引力传递的路径与共同创造的成长足迹。
        </div>

      </div>

      {/* Details sidebar and add form (Right) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Input New Contact Form (Collapsible/Overlay representation) */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-amber-400/30 rounded-2xl p-5 shadow-lg shadow-amber-950/10"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="font-sans font-medium text-amber-300 text-sm flex items-center gap-2">
                  <UserPlus size={15} />
                  <span>建立引力连结 (录入新联系人)</span>
                </h4>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  取消
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">生命星名 (姓名/代号)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="如: 王工程师"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">星轨角色 (分类)</label>
                    <select
                      value={type}
                      onChange={(e: any) => setType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400/50"
                    >
                      <option value="战友">战友 (Comrade)</option>
                      <option value="智囊">智囊 (Mentor)</option>
                      <option value="灵感">灵感 (Muse)</option>
                      <option value="后浪">后浪 (Protege)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">共鸣频率 (互动周期)</label>
                    <select
                      value={resonanceFrequency}
                      onChange={(e: any) => setResonanceFrequency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400/50"
                    >
                      <option value="周">周 (高频)</option>
                      <option value="月">月 (中频)</option>
                      <option value="季">季 (低频)</option>
                      <option value="年">年 (极简)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">初识来源 (相遇场景)</label>
                    <select
                      value={meetSource}
                      onChange={(e: any) => setMeetSource(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400/50"
                    >
                      <option value="活动">活动</option>
                      <option value="社群">社群</option>
                      <option value="工作">工作</option>
                      <option value="引荐">引荐</option>
                      <option value="随机">随机</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">初识日期 (结缘日)</label>
                    <input
                      type="date"
                      value={firstMetDate}
                      onChange={(e) => setFirstMetDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">引力介绍人 / 场景节点 (溯源路径)</label>
                  <select
                    required
                    value={introducerId}
                    onChange={(e) => setIntroducerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400/50"
                  >
                    <option value="">请选择连结引力的上级星轨...</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    * 必选：每一个生命节点的录入，都应溯源其引力推荐机制，形成脉络。
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/20"
                >
                  <Sparkles size={13} />
                  <span>重力定位并发射</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Star Info Card */}
        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
          {selectedNode ? (
            <div className="flex flex-col gap-4">
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-sans font-semibold text-slate-100 text-lg">
                      {selectedNode.name}
                    </h4>
                    {selectedNode.resonancePulse && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse">
                        星光微弱
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={"text-xs px-2.5 py-0.5 rounded-full border " + getEnergyColor(selectedNode.type)}>
                      {selectedNode.type}
                    </span>
                    <span className="text-slate-500 text-xs">
                      共鸣律动：{selectedNode.resonanceFrequency}级频率
                    </span>
                  </div>
                </div>
                <Users size={18} className="text-slate-600" />
              </div>

              {/* Gravity Origin Node Lineage (溯源) */}
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-2">
                  <Link2 size={13} className="text-amber-400" />
                  <span>引力溯源链条 (Origin Track)</span>
                </div>
                <div className="flex flex-col gap-2 relative pl-2 border-l border-slate-800 ml-1.5">
                  {recommendationPath.map((pathNodeId, index) => {
                    const node = contacts.find(c => c.id === pathNodeId);
                    if (!node) return null;
                    return (
                      <div key={pathNodeId} className="flex items-center gap-2 relative">
                        <span className="absolute -left-3.5 w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                        <span className="text-slate-500 font-mono text-[10px]">#{index + 1}</span>
                        <span className={pathNodeId === selectedNode.id ? "text-amber-300 font-medium" : "text-slate-300"}>
                          {node.name.split(" ")[0]}
                        </span>
                        <span className="text-[9px] text-slate-500">({node.type})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1">上一次滋养</div>
                  <div className="text-slate-200 font-mono">{selectedNode.lastInteractionDate}</div>
                </div>
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1">共同高光足迹</div>
                  <div className="text-slate-200 font-mono flex items-center gap-1.5">
                    <Zap size={12} className="text-amber-400" />
                    <span>{selectedNode.sharedRipplesCount} 次共鸣</span>
                  </div>
                </div>
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1 flex items-center gap-1">
                    <Calendar size={10} />初识日期
                  </div>
                  <div className="text-slate-200 font-mono">{selectedNode.firstMetDate}</div>
                </div>
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1 flex items-center gap-1">
                    <MapPin size={10} />来源场景
                  </div>
                  <div className="text-slate-200 font-mono">{selectedNode.meetSource}</div>
                </div>
              </div>

              {/* Common footprints (共同足迹) */}
              <div className="text-xs">
                <div className="text-slate-400 font-medium mb-1.5">共同参与的所有成就：</div>
                {selectedNode.id === "friend-2" ? (
                  <div className="p-2 bg-slate-950/20 border border-slate-800 rounded-lg text-slate-300 leading-relaxed text-[11px]">
                    ✦ “Momentum 核心技术架构设计”：共同攻克了3D粒子力学受力计算模型，李战一作为主战友贡献了关键坐标对齐代码。
                  </div>
                ) : selectedNode.id === "friend-1" ? (
                  <div className="p-2 bg-slate-950/20 border border-slate-800 rounded-lg text-slate-300 leading-relaxed text-[11px]">
                    ✦ “极简数字禅视觉交互规范”：张教授对界面布局提供了佛学美感建议；<br/>
                    ✦ “Momentum 技术架构”：共同探讨了意识波形与同心圆的映射。
                  </div>
                ) : selectedNode.id === "friend-4" ? (
                  <div className="p-2 bg-slate-950/20 border border-slate-800 rounded-lg text-slate-300 leading-relaxed text-[11px]">
                    ✦ “个人云服务端项目搭建”：陈小新在指导下，成功突破了 Docker 隔离层并顺利合流主仓库，实现了全套自建运维。
                  </div>
                ) : (
                  <div className="text-slate-600 text-[11px] italic">
                    尚未录入大型合著资产块。点击“滋养星云”可在未来将此联系人关联至新增的成就与善意涟漪中。
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Users size={32} className="text-slate-700 mb-2 animate-pulse" />
              <div className="text-slate-400 font-medium mb-1">未选中星辰</div>
              <div className="text-xs text-slate-500 max-w-[200px]">
                点击星云中任意一个光点，读取其引力谱系和共同绽放瞬间。
              </div>
            </div>
          )}

          {/* Action Button */}
          {selectedNode && (
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => onNurtureContact(selectedNode.id)}
                disabled={!selectedNode.resonancePulse}
                className={"w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer " + (selectedNode.resonancePulse ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/20" : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50")}
              >
                {selectedNode.resonancePulse ? (
                  <>
                    <Sparkles size={13} className="animate-spin" />
                    <span>滋养关系 (点亮这颗星)</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>星轨稳步共鸣中</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
