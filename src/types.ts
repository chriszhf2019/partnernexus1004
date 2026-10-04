/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SeedStatus = "萌芽" | "生长" | "绽放";

export interface WeeklySeed {
  id: string;
  category: "智慧" | "创造" | "连结" | "心性" | "体魄";
  title: string;
  momentumScore: number; // Represents momentum energy weight
  status: SeedStatus;
  createdAt: string;
  deadline?: string;
  expectedGrowth?: number;
  description?: string;
  progress?: number;
}

export interface WeekendHarvest {
  id: string;
  weekRange: string; // e.g., "06/15 - 06/21"
  journalText: string;
  aiCoachText: string;
  createdAt: string;
}

export type EnergyType = "智囊" | "战友" | "灵感" | "后浪";

export type MeetSource = "活动" | "社群" | "工作" | "引荐" | "随机" | "其他";

export interface GalaxyNode {
  id: string;
  name: string;
  type: EnergyType;
  introducerId: string | null;
  introducerName: string | null;
  resonanceFrequency: "周" | "月" | "季" | "年";
  lastInteractionDate: string;
  resonancePulse: boolean;
  sharedRipplesCount: number;
  firstMetDate: string;
  meetSource: MeetSource;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  category: "技术" | "方案" | "创意" | "贡献" | "其他";
  date: string;
  linkedFriendIds?: string[]; // Friends linked to this achievement
}

export interface KindnessRecord {
  id: string;
  target: string;
  act: string;
  date: string;
  rippleDepth: number; // Scale of impact
}

export interface WisdomBankItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
}

export interface TrajectoryNode {
  id: string;
  title: string;
  desc: string;
  date: string;
  heightValue: number; // upward position (for 3D rising curve trajectory representation)
  isBloom: boolean;
}
