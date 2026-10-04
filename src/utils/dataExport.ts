import {
  WeeklySeed,
  GalaxyNode,
  Achievement,
  KindnessRecord,
  WisdomBankItem,
  TrajectoryNode,
} from "../types";

export interface MomentumData {
  version: string;
  exportedAt: string;
  seeds: WeeklySeed[];
  contacts: GalaxyNode[];
  achievements: Achievement[];
  kindnessRipples: KindnessRecord[];
  wisdomItems: WisdomBankItem[];
  trajectoryNodes: TrajectoryNode[];
}

const STORAGE_KEYS = {
  seeds: "momentum_seeds",
  contacts: "momentum_contacts",
  achievements: "momentum_achievements",
  kindnessRipples: "momentum_kindnessRipples",
  wisdomItems: "momentum_wisdomItems",
  trajectoryNodes: "momentum_trajectoryNodes",
} as const;

const DATA_VERSION = "1.0";

export function exportData(): MomentumData {
  const getFromStorage = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    seeds: getFromStorage<WeeklySeed[]>(STORAGE_KEYS.seeds, []),
    contacts: getFromStorage<GalaxyNode[]>(STORAGE_KEYS.contacts, []),
    achievements: getFromStorage<Achievement[]>(STORAGE_KEYS.achievements, []),
    kindnessRipples: getFromStorage<KindnessRecord[]>(
      STORAGE_KEYS.kindnessRipples,
      []
    ),
    wisdomItems: getFromStorage<WisdomBankItem[]>(
      STORAGE_KEYS.wisdomItems,
      []
    ),
    trajectoryNodes: getFromStorage<TrajectoryNode[]>(
      STORAGE_KEYS.trajectoryNodes,
      []
    ),
  };
}

export function downloadExport() {
  const data = exportData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split("T")[0];
  const a = document.createElement("a");
  a.href = url;
  a.download = `momentum-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateData(data: unknown): data is MomentumData {
  if (!data || typeof data !== "object") return false;

  const d = data as Record<string, unknown>;

  if (typeof d.version !== "string") return false;
  if (typeof d.exportedAt !== "string") return false;

  const arrayKeys: (keyof typeof STORAGE_KEYS)[] = [
    "seeds",
    "contacts",
    "achievements",
    "kindnessRipples",
    "wisdomItems",
    "trajectoryNodes",
  ];

  for (const key of arrayKeys) {
    if (!Array.isArray(d[key])) return false;
  }

  return true;
}

export function importData(data: MomentumData): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.seeds, JSON.stringify(data.seeds));
    localStorage.setItem(
      STORAGE_KEYS.contacts,
      JSON.stringify(data.contacts)
    );
    localStorage.setItem(
      STORAGE_KEYS.achievements,
      JSON.stringify(data.achievements)
    );
    localStorage.setItem(
      STORAGE_KEYS.kindnessRipples,
      JSON.stringify(data.kindnessRipples)
    );
    localStorage.setItem(
      STORAGE_KEYS.wisdomItems,
      JSON.stringify(data.wisdomItems)
    );
    localStorage.setItem(
      STORAGE_KEYS.trajectoryNodes,
      JSON.stringify(data.trajectoryNodes)
    );
    return true;
  } catch (e) {
    console.error("Failed to import data:", e);
    return false;
  }
}

export async function readImportFile(file: File): Promise<MomentumData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (!validateData(data)) {
          reject(new Error("数据格式不正确，无法导入"));
          return;
        }
        resolve(data);
      } catch (err) {
        reject(new Error("文件解析失败，请确保是有效的 JSON 文件"));
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file);
  });
}
