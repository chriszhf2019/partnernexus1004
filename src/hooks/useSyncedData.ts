import { useEffect, useRef, useState, useCallback } from "react";
import { api, UserData } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// 防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface DataState {
  seeds: any[];
  contacts: any[];
  achievements: any[];
  kindnessRipples: any[];
  wisdomItems: any[];
  trajectoryNodes: any[];
  quarterlyGoals: any[];
}

const EMPTY_STATE: DataState = {
  seeds: [],
  contacts: [],
  achievements: [],
  kindnessRipples: [],
  wisdomItems: [],
  trajectoryNodes: [],
  quarterlyGoals: [],
};

/**
 * 同步数据 Hook - 自动从服务器加载和保存用户数据
 */
export function useSyncedData() {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<DataState>(EMPTY_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const isInitialLoad = useRef(true);

  // 防抖同步
  const debouncedData = useDebounce(data, 1500);

  // 加载数据
  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setData(EMPTY_STATE);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const serverData = await api.data.getAll();
      setData({
        seeds: serverData.seeds || [],
        contacts: serverData.contacts || [],
        achievements: serverData.achievements || [],
        kindnessRipples: serverData.kindnessRipples || [],
        wisdomItems: serverData.wisdomItems || [],
        trajectoryNodes: serverData.trajectoryNodes || [],
        quarterlyGoals: serverData.quarterlyGoals || [],
      });
      isInitialLoad.current = true; // 标记初始加载完成
    } catch (err: any) {
      setError(err.message || "数据加载失败");
      console.error("Load data error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // 登录时加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setData(EMPTY_STATE);
    }
  }, [isAuthenticated, user?.id, loadData]);

  // 自动同步到服务器
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const syncToServer = async () => {
      setSyncing(true);
      try {
        await api.data.sync(debouncedData);
      } catch (err: any) {
        console.error("Sync error:", err);
      } finally {
        setSyncing(false);
      }
    };

    syncToServer();
  }, [debouncedData, isAuthenticated]);

  return {
    data,
    setData,
    loading,
    error,
    syncing,
    reload: loadData,
  };
}
