import { WeeklySeed } from "../types";

type SeedStatus = WeeklySeed["status"];
type SeedCategory = WeeklySeed["category"];

export type SeedsAction =
  | { type: "ADD_SEED"; payload: { title: string; category: SeedCategory; deadline?: string; expectedGrowth?: number; description?: string } }
  | { type: "ADVANCE_SEED"; payload: { id: string } }
  | { type: "DELETE_SEED"; payload: { id: string } }
  | { type: "SET_SEEDS"; payload: WeeklySeed[] }
  | { type: "UPDATE_PROGRESS"; payload: { id: string; progress: number } };

export function seedsReducer(
  state: WeeklySeed[],
  action: SeedsAction
): WeeklySeed[] {
  switch (action.type) {
    case "ADD_SEED": {
      const { title, category, deadline, expectedGrowth, description } = action.payload;
      const newSeed: WeeklySeed = {
        id: `seed-${Date.now()}`,
        title: title.trim(),
        category,
        momentumScore: 5,
        status: "萌芽",
        createdAt: new Date().toISOString().split("T")[0],
        deadline,
        expectedGrowth,
        description,
        progress: 0,
      };
      return [newSeed, ...state];
    }

    case "ADVANCE_SEED": {
      const { id } = action.payload;
      return state.map((seed) => {
        if (seed.id !== id) return seed;

        const statusOrder: SeedStatus[] = ["萌芽", "生长", "绽放"];
        const currentIndex = statusOrder.indexOf(seed.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        const nextStatus = statusOrder[nextIndex];

        let newProgress = seed.progress || 0;
        if (nextStatus === "生长") newProgress = 50;
        if (nextStatus === "绽放") newProgress = 100;
        if (nextStatus === "萌芽") newProgress = 0;

        return {
          ...seed,
          status: nextStatus,
          momentumScore:
            seed.momentumScore + (nextStatus === "绽放" ? 5 : 2),
          progress: newProgress,
        };
      });
    }

    case "DELETE_SEED": {
      const { id } = action.payload;
      return state.filter((seed) => seed.id !== id);
    }

    case "SET_SEEDS":
      return action.payload;

    case "UPDATE_PROGRESS": {
      const { id, progress } = action.payload;
      return state.map((seed) => {
        if (seed.id !== id) return seed;
        const clampedProgress = Math.max(0, Math.min(100, progress));
        let newStatus: SeedStatus = seed.status;
        if (clampedProgress >= 100) newStatus = "绽放";
        else if (clampedProgress >= 30) newStatus = "生长";
        else newStatus = "萌芽";
        return {
          ...seed,
          progress: clampedProgress,
          status: newStatus,
        };
      });
    }

    default:
      return state;
  }
}
