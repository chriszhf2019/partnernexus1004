import { GalaxyNode, MeetSource } from "../types";

export function safeDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

export function safeToLocaleDateString(
  dateStr: string | null | undefined,
  locale: string = "zh-CN",
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    const d = safeDate(dateStr);
    return d.toLocaleDateString(locale, options);
  } catch {
    const d = new Date();
    try {
      return d.toLocaleDateString(locale, options);
    } catch {
      return dateStr || "";
    }
  }
}

const FREQUENCY_DAYS: Record<GalaxyNode["resonanceFrequency"], number> = {
  周: 7,
  月: 30,
  季: 90,
  年: 365,
};

export function getDaysSinceInteraction(lastDateStr: string): number {
  const lastDate = safeDate(lastDateStr);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isStarDimming(contact: GalaxyNode): boolean {
  const daysSince = getDaysSinceInteraction(contact.lastInteractionDate);
  const frequencyDays = FREQUENCY_DAYS[contact.resonanceFrequency];
  return daysSince >= frequencyDays;
}

export function getDimmingLevel(contact: GalaxyNode): "normal" | "fading" | "dim" {
  const daysSince = getDaysSinceInteraction(contact.lastInteractionDate);
  const frequencyDays = FREQUENCY_DAYS[contact.resonanceFrequency];
  
  if (daysSince >= frequencyDays * 2) return "dim";
  if (daysSince >= frequencyDays) return "fading";
  return "normal";
}

export function getDimmingContacts(contacts: GalaxyNode[]): GalaxyNode[] {
  return contacts.filter((c) => isStarDimming(c));
}

export function getDaysSinceMet(firstMetDateStr: string): number {
  const metDate = safeDate(firstMetDateStr);
  const today = new Date();
  const diffTime = today.getTime() - metDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getWeekStart(dateStr: string): string {
  const d = safeDate(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = safeDate(new Date(d.setDate(diff)).toISOString());
  return monday.toISOString().split("T")[0];
}

export function formatDateLabel(dateStr: string): string {
  const d = safeDate(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatWeekLabel(weekStartStr: string): string {
  const start = safeDate(weekStartStr);
  const end = safeDate(new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString());
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
}

export interface TimelineGroup {
  key: string;
  label: string;
  contacts: GalaxyNode[];
  count: number;
}

export function groupContactsByDay(contacts: GalaxyNode[]): TimelineGroup[] {
  const groups: Record<string, GalaxyNode[]> = {};
  contacts.forEach((c) => {
    const key = c.firstMetDate;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => safeDate(b).getTime() - safeDate(a).getTime())
    .map(([key, items]) => ({
      key,
      label: formatDateLabel(key),
      contacts: items,
      count: items.length,
    }));
}

export function groupContactsByWeek(contacts: GalaxyNode[]): TimelineGroup[] {
  const groups: Record<string, GalaxyNode[]> = {};
  contacts.forEach((c) => {
    const key = getWeekStart(c.firstMetDate);
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => safeDate(b).getTime() - safeDate(a).getTime())
    .map(([key, items]) => ({
      key,
      label: formatWeekLabel(key),
      contacts: items,
      count: items.length,
    }));
}

export interface SourceStat {
  source: MeetSource;
  count: number;
  percentage: number;
}

export function getSourceStats(contacts: GalaxyNode[]): SourceStat[] {
  const counts: Record<MeetSource, number> = {
    活动: 0,
    社群: 0,
    工作: 0,
    引荐: 0,
    随机: 0,
    其他: 0,
  };
  contacts.forEach((c) => {
    counts[c.meetSource] = (counts[c.meetSource] || 0) + 1;
  });
  const total = contacts.length || 1;
  return (Object.keys(counts) as MeetSource[])
    .map((source) => ({
      source,
      count: counts[source],
      percentage: Math.round((counts[source] / total) * 100),
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function getNewThisWeek(contacts: GalaxyNode[]): number {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return contacts.filter((c) => safeDate(c.firstMetDate) >= weekStart).length;
}

export function getNewThisMonth(contacts: GalaxyNode[]): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return contacts.filter((c) => safeDate(c.firstMetDate) >= monthStart).length;
}
