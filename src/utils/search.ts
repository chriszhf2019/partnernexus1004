import { WeeklySeed, GalaxyNode, Achievement, KindnessRecord, WisdomBankItem } from "../types";

export type SearchResultType = 
  | "seed" 
  | "contact" 
  | "achievement" 
  | "kindness" 
  | "wisdom";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  tab: "core" | "web" | "ripple";
  icon?: string;
}

export interface SearchableData {
  seeds: WeeklySeed[];
  contacts: GalaxyNode[];
  achievements: Achievement[];
  kindnessRipples: KindnessRecord[];
  wisdomItems: WisdomBankItem[];
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function matchScore(query: string, text: string): number {
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);
  
  if (normalizedText === normalizedQuery) return 100;
  if (normalizedText.startsWith(normalizedQuery)) return 80;
  if (normalizedText.includes(normalizedQuery)) return 60;
  
  // Fuzzy match for Chinese
  const queryChars = normalizedQuery.split("");
  const textChars = normalizedText.split("");
  let matchCount = 0;
  let lastMatchIndex = -1;
  
  for (const char of queryChars) {
    const foundIndex = textChars.findIndex((c, i) => i > lastMatchIndex && c === char);
    if (foundIndex !== -1) {
      matchCount++;
      lastMatchIndex = foundIndex;
    }
  }
  
  if (matchCount === queryChars.length) return 40;
  if (matchCount > 0) return matchCount * 10;
  
  return 0;
}

export function search(query: string, data: SearchableData): SearchResult[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const results: (SearchResult & { score: number })[] = [];

  // Search seeds
  for (const seed of data.seeds) {
    const titleScore = matchScore(trimmedQuery, seed.title);
    const categoryScore = matchScore(trimmedQuery, seed.category);
    const statusScore = matchScore(trimmedQuery, seed.status);
    const maxScore = Math.max(titleScore, categoryScore, statusScore);
    
    if (maxScore > 0) {
      results.push({
        id: seed.id,
        type: "seed",
        title: seed.title,
        subtitle: `${seed.category} · ${seed.status} · 动能 ${seed.momentumScore}`,
        tab: "core",
        score: maxScore,
      });
    }
  }

  // Search contacts
  for (const contact of data.contacts) {
    const nameScore = matchScore(trimmedQuery, contact.name);
    const typeScore = matchScore(trimmedQuery, contact.type);
    const maxScore = Math.max(nameScore, typeScore);
    
    if (maxScore > 0) {
      results.push({
        id: contact.id,
        type: "contact",
        title: contact.name,
        subtitle: `${contact.type} · 共鸣周期 ${contact.resonanceFrequency}`,
        tab: "web",
        score: maxScore,
      });
    }
  }

  // Search achievements
  for (const achievement of data.achievements) {
    const titleScore = matchScore(trimmedQuery, achievement.title);
    const descScore = matchScore(trimmedQuery, achievement.desc);
    const maxScore = Math.max(titleScore, descScore);
    
    if (maxScore > 0) {
      results.push({
        id: achievement.id,
        type: "achievement",
        title: achievement.title,
        subtitle: achievement.desc.slice(0, 50) + (achievement.desc.length > 50 ? "..." : ""),
        tab: "ripple",
        score: maxScore,
      });
    }
  }

  // Search kindness ripples
  for (const kindness of data.kindnessRipples) {
    const targetScore = matchScore(trimmedQuery, kindness.target);
    const actScore = matchScore(trimmedQuery, kindness.act);
    const maxScore = Math.max(targetScore, actScore);
    
    if (maxScore > 0) {
      results.push({
        id: kindness.id,
        type: "kindness",
        title: kindness.target,
        subtitle: kindness.act.slice(0, 40) + (kindness.act.length > 40 ? "..." : ""),
        tab: "ripple",
        score: maxScore,
      });
    }
  }

  // Search wisdom items
  for (const wisdom of data.wisdomItems) {
    const contentScore = matchScore(trimmedQuery, wisdom.content);
    const titleScore = matchScore(trimmedQuery, wisdom.title);
    const maxScore = Math.max(contentScore, titleScore);
    
    if (maxScore > 0) {
      results.push({
        id: wisdom.id,
        type: "wisdom",
        title: wisdom.content.slice(0, 40) + (wisdom.content.length > 40 ? "..." : ""),
        subtitle: `标签：${wisdom.tags.join(", ")}`,
        tab: "ripple",
        score: maxScore,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 20);
}
