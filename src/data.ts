import { WeeklySeed, GalaxyNode, Achievement, KindnessRecord, WisdomBankItem, TrajectoryNode } from "./types";

export const initialSeeds: WeeklySeed[] = [
  {
    id: "seed-1",
    category: "智慧",
    title: "深度掌握 TypeScript 高级元编程与类型安全",
    momentumScore: 12,
    status: "生长",
    createdAt: "2026-06-21",
    deadline: "2026-07-21",
    expectedGrowth: 20,
    description: "掌握 TypeScript 高级类型体操、条件类型、映射类型，提升代码类型安全",
    progress: 60
  },
  {
    id: "seed-2",
    category: "创造",
    title: "手写 Momentum 引力粒子渲染器",
    momentumScore: 15,
    status: "绽放",
    createdAt: "2026-06-22",
    deadline: "2026-06-30",
    expectedGrowth: 25,
    description: "基于 Canvas 实现重力粒子系统，打造星系视觉效果",
    progress: 100
  },
  {
    id: "seed-3",
    category: "连结",
    title: "与数字禅导师张教授探讨生命同心圆能量脉络",
    momentumScore: 10,
    status: "绽放",
    createdAt: "2026-06-22",
    deadline: "2026-06-25",
    expectedGrowth: 15,
    description: "深入探讨同心圆模型在个人成长中的应用",
    progress: 100
  },
  {
    id: "seed-4",
    category: "心性",
    title: "每日清晨进行 15 分钟专注止观禅修",
    momentumScore: 8,
    status: "萌芽",
    createdAt: "2026-06-23",
    deadline: "2026-07-23",
    expectedGrowth: 10,
    description: "培养每日冥想习惯，提升专注力和内心平静",
    progress: 10
  },
  {
    id: "seed-5",
    category: "体魄",
    title: "进行三次 5 公里晨跑，汲取晨曦能量",
    momentumScore: 10,
    status: "生长",
    createdAt: "2026-06-20",
    deadline: "2026-07-01",
    expectedGrowth: 15,
    description: "每周三次晨跑，增强体能和精神状态",
    progress: 65
  }
];

export const initialFriends: GalaxyNode[] = [
  {
    id: "friend-root",
    name: "数字禅沙龙",
    type: "灵感",
    introducerId: null,
    introducerName: "源起节点 (星系中心)",
    resonanceFrequency: "月",
    lastInteractionDate: "2026-06-01",
    resonancePulse: false,
    sharedRipplesCount: 5,
    firstMetDate: "2026-01-10",
    meetSource: "社群"
  },
  {
    id: "friend-1",
    name: "张教授 (数字禅智囊)",
    type: "智囊",
    introducerId: "friend-root",
    introducerName: "数字禅沙龙",
    resonanceFrequency: "周",
    lastInteractionDate: "2026-06-22",
    resonancePulse: false,
    sharedRipplesCount: 3,
    firstMetDate: "2026-03-05",
    meetSource: "活动"
  },
  {
    id: "friend-2",
    name: "李战一 (极客战友)",
    type: "战友",
    introducerId: "friend-1",
    introducerName: "张教授 (数字禅智囊)",
    resonanceFrequency: "月",
    lastInteractionDate: "2026-05-15",
    resonancePulse: true,
    sharedRipplesCount: 4,
    firstMetDate: "2026-04-20",
    meetSource: "引荐"
  },
  {
    id: "friend-3",
    name: "苏格拉星 (哲学 Muse)",
    type: "灵感",
    introducerId: "friend-root",
    introducerName: "数字禅沙龙",
    resonanceFrequency: "季",
    lastInteractionDate: "2026-06-10",
    resonancePulse: false,
    sharedRipplesCount: 2,
    firstMetDate: "2026-02-18",
    meetSource: "社群"
  },
  {
    id: "friend-4",
    name: "陈小新 (后浪学生)",
    type: "后浪",
    introducerId: "friend-2",
    introducerName: "李战一 (极客战友)",
    resonanceFrequency: "周",
    lastInteractionDate: "2026-06-23",
    resonancePulse: false,
    sharedRipplesCount: 1,
    firstMetDate: "2026-05-18",
    meetSource: "引荐"
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "Momentum (念) 核心技术架构设计",
    desc: "将自我生长与人脉脉络融合成 3D 粒子流的同心圆架构，成功发表在技术社区，获得极高共鸣。",
    category: "技术",
    date: "2026-06-12",
    linkedFriendIds: ["friend-1", "friend-2"]
  },
  {
    id: "ach-2",
    title: "极简数字禅视觉交互规范制定",
    desc: "提炼晨曦金与深邃蓝的 Digital Zen 界面风格，放弃所有具有强迫感、倒计时的负面焦虑词汇，用能量和生长点重新诠释自我管理。",
    category: "创意",
    date: "2026-06-18",
    linkedFriendIds: ["friend-1", "friend-3"]
  },
  {
    id: "ach-3",
    title: "搭建轻量级个人分布式云服务端",
    desc: "无偿教授并协助后浪陈小新完成了他个人第一个全栈应用的部署，使其访问量破千。",
    category: "贡献",
    date: "2026-06-23",
    linkedFriendIds: ["friend-4"]
  }
];

export const initialKindnessRipples: KindnessRecord[] = [
  {
    id: "kind-1",
    target: "陈小新",
    act: "耐心解答他关于高并发场景下重力力导向算法性能瓶颈的困惑，协助优化了画布渲染速度。",
    date: "2026-06-22",
    rippleDepth: 3
  },
  {
    id: "kind-2",
    target: "开源开发者社区",
    act: "在主流前端框架中修复了一个关于多层嵌套动画在 iframe 下卡顿的经典 bug，使得全球数万应用受益。",
    date: "2026-06-19",
    rippleDepth: 5
  },
  {
    id: "kind-3",
    target: "静修室伙伴",
    act: "分享《专注律动：如何在万物喧嚣中维持内心的频率》文章，并免费提供一份系统配置模板。",
    date: "2026-06-20",
    rippleDepth: 2
  }
];

export const initialWisdomItems: WisdomBankItem[] = [
  {
    id: "wis-1",
    title: "同心圆生长定律 (Concentric Growth Law)",
    content: "生命的扩张是一个向外的波纹。只有先深深根植于核心自我（内圆），掌握坚实的生长节奏，才能拉开富有吸引力的中圆关系网络；而自我与网络的深度共鸣，又必然自然而然地流向外圆，留下影响世界的善良涟漪。不可本末倒置。",
    tags: ["生命律动", "思维模型", "心性成长"],
    date: "2026-06-10"
  },
  {
    id: "wis-2",
    title: "时间加法哲学 (Additive Time Philosophy)",
    content: "凡俗的管理聚焦在剩余时间的减法，这往往带来焦虑与空虚。Momentum 秉承时间加法：时间流逝无法阻挡，但每一次我们选择静心、结交、创造、给予，都是在流逝的时间上叠加上升的粒子。我们看的是能量的堆叠，看的是微光的扩张。",
    tags: ["时间管理", "数字禅", "心能增值"],
    date: "2026-06-15"
  },
  {
    id: "wis-3",
    title: "引力回响与自生连结 (Gravitational Resonance)",
    content: "不要去‘追逐’蝴蝶，而是要‘盛开’一朵花，去吸引那些拥有契合轨道的星辰。不使用具有催促和侵入感的常规社交工具，利用‘共鸣频率’观察星星的明灭。星灭了代表该去灌溉这层养分，星亮着说明轨道正稳稳共振。",
    tags: ["引力人脉", "人际哲学"],
    date: "2026-06-20"
  }
];

export const initialTrajectoryNodes: TrajectoryNode[] = [
  { id: "traj-1", title: "萌芽探索期", desc: "确立数字禅设计美学，放弃一切倒计时及Deadline词汇", date: "2026-01-10", heightValue: 20, isBloom: false },
  { id: "traj-2", title: "能量聚集点", desc: "与张教授建立引力锚定，激发同心圆架构灵感", date: "2026-03-05", heightValue: 35, isBloom: false },
  { id: "traj-3", title: "中轴生长突破", desc: "首创引力导向星系图交互方案，并应用于 Momentum 核心层", date: "2026-04-20", heightValue: 60, isBloom: true },
  { id: "traj-4", title: "善意漫流涟漪", desc: "成功扶持陈小新搭建起个人云，产生跨维度的连结效应", date: "2026-05-18", heightValue: 75, isBloom: true },
  { id: "traj-5", title: "当前能量峰值", desc: "整合自我、网络与影响三大核心层，让生命发出回响", date: "2026-06-23", heightValue: 95, isBloom: true }
];
