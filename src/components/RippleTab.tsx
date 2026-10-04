import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Briefcase,
  BookOpen,
  Search,
  Plus,
  Check,
  Sparkles,
  Users,
  TrendingUp,
  Globe,
  Lightbulb,
} from "lucide-react";
import { Achievement, KindnessRecord, WisdomBankItem, GalaxyNode } from "../types";
import { ZenCard, ZenButton, ZenBadge, SectionHeader, ZenInput, ZenTextarea } from "./ui";
import { AchievementCard, KindnessCard } from "./cards";
import { FamilyTeamGrowth } from "./FamilyTeamGrowth";
import { RippleAsset } from "./RippleAsset";

interface RippleTabProps {
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  kindnessRipples: KindnessRecord[];
  setKindnessRipples: React.Dispatch<React.SetStateAction<KindnessRecord[]>>;
  wisdomItems: WisdomBankItem[];
  setWisdomItems: React.Dispatch<React.SetStateAction<WisdomBankItem[]>>;
  contacts: GalaxyNode[];
  setContacts: React.Dispatch<React.SetStateAction<GalaxyNode[]>>;
  activeRippleEffect: { id: string; target: string; depth: number } | null;
  setActiveRippleEffect: React.Dispatch<
    React.SetStateAction<{ id: string; target: string; depth: number } | null>
  >;
}

export function RippleTab({
  achievements,
  setAchievements,
  kindnessRipples,
  setKindnessRipples,
  wisdomItems,
  setWisdomItems,
  contacts,
  setContacts,
  activeRippleEffect,
  setActiveRippleEffect,
}: RippleTabProps) {
  const [wisdomSearch, setWisdomSearch] = useState("");
  const [selectedWisdomTag, setSelectedWisdomTag] = useState<string | null>(null);

  const [newAchTitle, setNewAchTitle] = useState("");
  const [newAchDesc, setNewAchDesc] = useState("");
  const [newAchCategory, setNewAchCategory] = useState<
    "技术" | "方案" | "创意" | "贡献"
  >("技术");
  const [newAchFriends, setNewAchFriends] = useState<string[]>([]);

  const [newKindTarget, setNewKindTarget] = useState("");
  const [newKindAct, setNewKindAct] = useState("");
  const [newKindDepth, setNewKindDepth] = useState<number>(3);

  const [newWisTitle, setNewWisTitle] = useState("");
  const [newWisContent, setNewWisContent] = useState("");
  const [newWisTags, setNewWisTags] = useState("");

  const filteredWisdom = useMemo(() => {
    return wisdomItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(wisdomSearch.toLowerCase()) ||
        item.content.toLowerCase().includes(wisdomSearch.toLowerCase());
      const matchesTag = selectedWisdomTag
        ? item.tags.includes(selectedWisdomTag)
        : true;
      return matchesSearch && matchesTag;
    });
  }, [wisdomItems, wisdomSearch, selectedWisdomTag]);

  const allWisdomTags = useMemo(() => {
    return Array.from(new Set(wisdomItems.flatMap((item) => item.tags)));
  }, [wisdomItems]);

  // 计算影响力统计
  const impactStats = useMemo(() => {
    // 计算帮助过的人数（通过善意涟漪）
    const uniqueTargets = new Set(kindnessRipples.map((r) => r.target)).size;

    // 计算涟漪扩散总次数
    const totalRipples = kindnessRipples.reduce((sum, r) => sum + r.rippleDepth, 0);

    // 计算智慧分享次数
    const wisdomShares = wisdomItems.length;

    // 计算影响指数（综合指标）
    const impactScore =
      achievements.length * 10 +
      uniqueTargets * 5 +
      totalRipples * 2 +
      wisdomShares * 3;

    return {
      uniqueTargets,
      totalRipples,
      wisdomShares,
      impactScore,
      achievementCount: achievements.length,
      kindnessCount: kindnessRipples.length,
    };
  }, [achievements, kindnessRipples, wisdomItems]);

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchTitle.trim() || !newAchDesc.trim()) return;

    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      title: newAchTitle.trim(),
      desc: newAchDesc.trim(),
      category: newAchCategory,
      date: new Date().toISOString().split("T")[0],
      linkedFriendIds: newAchFriends.length > 0 ? newAchFriends : undefined,
    };

    setAchievements((prev) => [newAch, ...prev]);

    if (newAchFriends.length > 0) {
      setContacts((prev) =>
        prev.map((c) => {
          if (newAchFriends.includes(c.id)) {
            return { ...c, sharedRipplesCount: c.sharedRipplesCount + 1 };
          }
          return c;
        })
      );
    }

    setNewAchTitle("");
    setNewAchDesc("");
    setNewAchFriends([]);
  };

  const handleAddKindness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKindTarget.trim() || !newKindAct.trim()) return;

    const newRecord: KindnessRecord = {
      id: `kind-${Date.now()}`,
      target: newKindTarget.trim(),
      act: newKindAct.trim(),
      date: new Date().toISOString().split("T")[0],
      rippleDepth: newKindDepth,
    };

    setKindnessRipples((prev) => [newRecord, ...prev]);

    setActiveRippleEffect({
      id: newRecord.id,
      target: newRecord.target,
      depth: newRecord.rippleDepth,
    });

    setNewKindTarget("");
    setNewKindAct("");
    setNewKindDepth(3);

    setTimeout(() => {
      setActiveRippleEffect(null);
    }, 2500);
  };

  const handleTriggerRippleAnimation = useCallback((record: KindnessRecord) => {
    setActiveRippleEffect({
      id: record.id,
      target: record.target,
      depth: record.rippleDepth,
    });
    setTimeout(() => {
      setActiveRippleEffect(null);
    }, 2500);
  }, [setActiveRippleEffect]);

  const handleAddWisdom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWisTitle.trim() || !newWisContent.trim()) return;

    const tagsArr = newWisTags
      .split(/[，,、\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newWis: WisdomBankItem = {
      id: `wis-${Date.now()}`,
      title: newWisTitle.trim(),
      content: newWisContent.trim(),
      tags: tagsArr.length > 0 ? tagsArr : ["生长复利"],
      date: new Date().toISOString().split("T")[0],
    };

    setWisdomItems((prev) => [newWis, ...prev]);
    setNewWisTitle("");
    setNewWisContent("");
    setNewWisTags("");
  };

  return (
    <motion.div
      key="tab-ripple"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Ripple overlay visualizer */}
      <AnimatePresence>
        {activeRippleEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px]"
          >
            <div className="relative flex items-center justify-center">
              {[...Array(activeRippleEffect.depth)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 40, height: 40, opacity: 0.8 }}
                  animate={{
                    width: 100 + i * 160,
                    height: 100 + i * 160,
                    opacity: 0,
                    transition: {
                      duration: 2.2,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: 0.1,
                    },
                  }}
                  className="absolute border border-amber-400/30 rounded-full"
                />
              ))}

              <motion.div
                initial={{ scale: 0.8, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-slate-900/90 border border-amber-400 px-6 py-4 rounded-2xl text-center max-w-sm shadow-2xl shadow-amber-950/35 pointer-events-auto backdrop-blur-md"
              >
                <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400 flex items-center justify-center mx-auto mb-2 text-amber-300">
                  <Heart size={18} className="animate-pulse" />
                </div>
                <h4 className="font-sans font-semibold text-amber-300 text-sm">
                  善意涟漪漫流：{activeRippleEffect.target}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  微光漫流，引力传递。你给予他人的能量正在同心圆中层层扩散。
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro summary */}
      <div className="bg-slate-900/30 p-4 border border-slate-900 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-medium text-slate-200 text-sm">
            外圆：世界影响与涟漪 (World Impact & Ripples)
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            将你的高光沉淀为资产，把你的善意散播为扩散的涟漪，将你生命实践所得的心法结晶，化为可长久复利的智慧银行。
          </p>
        </div>
        {/* 影响力统计面板 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <TrendingUp size={10} />
              <span>影响指数</span>
            </div>
            <div className="text-amber-400 font-mono font-bold text-sm">
              +{impactStats.impactScore}
            </div>
          </div>
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <Users size={10} />
              <span>帮助人数</span>
            </div>
            <div className="text-amber-400 font-mono font-bold text-sm">
              {impactStats.uniqueTargets}
            </div>
          </div>
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <Globe size={10} />
              <span>涟漪扩散</span>
            </div>
            <div className="text-amber-400 font-mono font-bold text-sm">
              {impactStats.totalRipples} 层
            </div>
          </div>
          <div className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px] mb-1">
              <Lightbulb size={10} />
              <span>智慧分享</span>
            </div>
            <div className="text-amber-400 font-mono font-bold text-sm">
              {impactStats.wisdomShares}
            </div>
          </div>
        </div>
      </div>

      {/* 影响力资产仪表盘 */}
      <RippleAsset
        achievements={achievements}
        kindnessRipples={kindnessRipples}
        wisdomItems={wisdomItems}
        contacts={contacts}
      />

      {/* Subgrid: Achievement blocks and Kindness Ripples */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Achievement asset gallery (成就长廊) */}
        <ZenCard className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <SectionHeader
              icon={<Briefcase size={16} />}
              title="成就长廊 / 资产块 (Achievement Gallery)"
              subtitle="将工作与创造转化为资产"
            />

            {/* Add Achievement Form */}
            <form
              onSubmit={handleAddAchievement}
              className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl mb-4 text-xs space-y-2.5"
            >
              <div className="flex gap-2">
                <ZenInput
                  type="text"
                  required
                  placeholder="资产标题 (如: 编写 Momentum 重力算法)"
                  value={newAchTitle}
                  onChange={(e) => setNewAchTitle(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={newAchCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setNewAchCategory(e.target.value as any)
                  }
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 text-slate-200 focus:outline-none"
                >
                  <option value="技术">技术</option>
                  <option value="方案">方案</option>
                  <option value="创意">创意</option>
                  <option value="贡献">贡献</option>
                </select>
              </div>
              <ZenTextarea
                rows={2}
                required
                placeholder="沉淀叙事 (描述该成果的方法论资产，以及它解决了什么痛点)"
                value={newAchDesc}
                onChange={(e) => setNewAchDesc(e.target.value)}
              />

              {/* Link friends checkbox selection */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">
                  关联的星系共创伙伴 (多选)：
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {contacts
                    .filter((c) => c.introducerId !== null)
                    .map((c) => {
                      const isLinked = newAchFriends.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            if (isLinked) {
                              setNewAchFriends((prev) =>
                                prev.filter((id) => id !== c.id)
                              );
                            } else {
                              setNewAchFriends((prev) => [...prev, c.id]);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] border transition-all ${
                            isLinked
                              ? "bg-amber-400 text-slate-950 font-medium border-amber-300"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {c.name.split(" ")[0]}
                        </button>
                      );
                    })}
                </div>
              </div>

              <ZenButton type="submit" size="sm" className="w-full">
                铸造为个人核心成就资产块
              </ZenButton>
            </form>

            {/* Display Achievements Grid */}
            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {achievements.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  contacts={contacts}
                />
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">
            “成就不是消耗，是转化为可查阅的数字资产块，赋予你厚重的履历底气。”
          </div>
        </ZenCard>

        {/* Right: Kindness Ripple logging & Playback */}
        <ZenCard className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <SectionHeader
              icon={<Heart size={16} />}
              title="善意漫流 (Kindness Ripple)"
              subtitle="记录善意，触发波纹"
            />

            {/* Add Kindness Form */}
            <form
              onSubmit={handleAddKindness}
              className="bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl mb-4 text-xs space-y-2"
            >
              <div>
                <ZenInput
                  type="text"
                  required
                  placeholder="帮助或启发了谁？(如: 陈小新)"
                  value={newKindTarget}
                  onChange={(e) => setNewKindTarget(e.target.value)}
                />
              </div>
              <div>
                <ZenTextarea
                  rows={2}
                  required
                  placeholder="具体行径 (如何对其产生积极启发、指引或解答？)"
                  value={newKindAct}
                  onChange={(e) => setNewKindAct(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-slate-500 shrink-0">
                  能量扩散半径 (深度)：
                </span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newKindDepth}
                  onChange={(e) => setNewKindDepth(Number(e.target.value))}
                  className="flex-1 accent-amber-400 cursor-pointer h-1 bg-slate-800 rounded-lg"
                />
                <span className="text-amber-400 font-mono font-bold shrink-0">
                  {newKindDepth} 级
                </span>
              </div>
              <ZenButton type="submit" size="sm" className="w-full">
                投掷善意并播放同心圆涟漪
              </ZenButton>
            </form>

            {/* Kindness List */}
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {kindnessRipples.map((ripple) => (
                <KindnessCard
                  key={ripple.id}
                  record={ripple}
                  onTriggerRipple={handleTriggerRippleAnimation}
                />
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-800/80 pt-2.5 mt-3">
            * 点击任意善意记录，即可在屏幕中心重新渲染涟漪扩散动画。
          </div>
        </ZenCard>
      </div>

      {/* Full-width block: Wisdom Bank (知识复利 - 个人思想操作系统) */}
      <ZenCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-amber-300" />
            <div>
              <h3 className="font-sans font-medium tracking-wide text-slate-200 text-sm">
                知识复利库 (Wisdom Bank)
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                沉淀你的人生心法与思维模型，形成可传承的个人思维操作系统
              </p>
            </div>
          </div>

          {/* Search and Tag filter filters bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <ZenInput
                type="text"
                placeholder="检索心法心经..."
                value={wisdomSearch}
                onChange={(e) => setWisdomSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-[180px]"
              />
              <Search
                size={12}
                className="absolute left-2.5 top-2.5 text-slate-500"
              />
            </div>

            {selectedWisdomTag && (
              <ZenButton
                variant="primary"
                size="sm"
                onClick={() => setSelectedWisdomTag(null)}
              >
                清除筛选: #{selectedWisdomTag}
              </ZenButton>
            )}
          </div>
        </div>

        {/* Two column grid: Add form and displaying lists */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Input card (Left) */}
          <div className="md:col-span-4 bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-xs">
            <h4 className="font-sans font-medium text-amber-300 mb-3 flex items-center gap-1.5">
              <Plus size={13} />
              <span>撰写心法操作系统块</span>
            </h4>

            <form onSubmit={handleAddWisdom} className="space-y-3">
              <div>
                <label className="block text-slate-500 mb-0.5">
                  心法学名 / 理论代号
                </label>
                <ZenInput
                  type="text"
                  required
                  placeholder="如: 契卡阻尼原理"
                  value={newWisTitle}
                  onChange={(e) => setNewWisTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">
                  心经解说 (方法论实质内容)
                </label>
                <ZenTextarea
                  rows={3}
                  required
                  placeholder="在什么情境下，采取怎样的方法进行能量增值？"
                  value={newWisContent}
                  onChange={(e) => setNewWisContent(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">
                  思想标签 (逗号隔开)
                </label>
                <ZenInput
                  type="text"
                  placeholder="如: 深度复利, 决策逻辑, 心智免疫"
                  value={newWisTags}
                  onChange={(e) => setNewWisTags(e.target.value)}
                />
              </div>

              <ZenButton type="submit" size="sm" className="w-full">
                归档至知识复利库
              </ZenButton>
            </form>
          </div>

          {/* Filtered list block (Right) */}
          <div className="md:col-span-8 flex flex-col gap-3">
            {/* Popular Filter Tags */}
            <div className="flex flex-wrap gap-1.5 pb-2">
              {allWisdomTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedWisdomTag(tag === selectedWisdomTag ? null : tag)
                  }
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    tag === selectedWisdomTag
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-semibold"
                      : "bg-slate-950/40 text-slate-400 border-slate-900 hover:border-slate-800"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* Display Items List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {filteredWisdom.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/50 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-800 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 border-b border-slate-900 pb-1.5 mb-2">
                      <h5 className="font-sans font-semibold text-slate-200 text-xs">
                        {item.title}
                      </h5>
                      <span className="text-[8px] text-slate-600 font-mono">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSelectedWisdomTag(tag)}
                        className="text-[8px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 hover:text-amber-300 border border-slate-800 cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {filteredWisdom.length === 0 && (
                <div className="sm:col-span-2 text-center py-10 text-slate-600 text-xs italic">
                  没有检索到对应的思维操作系统块。
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 家庭/团队成长 */}
        <FamilyTeamGrowth />
      </ZenCard>
    </motion.div>
  );
}
