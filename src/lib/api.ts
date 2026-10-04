// API 客户端 - 与后端服务通信

const API_BASE = "/api";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  return localStorage.getItem("momentum_token");
}

async function request<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const token = getToken();
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!skipAuth && token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: "include",
  });

  // 处理 401
  if (response.status === 401) {
    localStorage.removeItem("momentum_token");
    localStorage.removeItem("momentum_user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new ApiError("请先登录", 401);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || `请求失败 (${response.status})`, response.status);
  }

  return data;
}

export const api = {
  // 认证
  auth: {
    register: (email: string, password: string, name?: string) =>
      request<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
        skipAuth: true,
      }),
    login: (email: string, password: string) =>
      request<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request<{ user: User }>("/auth/me"),
    updatePreferences: (prefs: { theme?: string; onboardingCompleted?: boolean }) =>
      request("/auth/preferences", {
        method: "PATCH",
        body: JSON.stringify(prefs),
      }),
  },

  // 数据
  data: {
    getAll: () => request<UserData>("/data/all"),
    sync: (data: Partial<UserData>) =>
      request("/data/sync", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // 打卡
  checkin: {
    checkIn: () => request<{ success: boolean; streak: number; isNew: boolean }>(
      "/checkin",
      { method: "POST" }
    ),
    get: () => request<{ canCheckIn: boolean; recentStreak: number; history: any[] }>(
      "/checkin"
    ),
  },

  // AI Coach
  coach: (data: {
    weeklySeeds?: any[];
    journalText?: string;
    achievements?: any[];
    contacts?: any[];
  }) =>
    request<{ success: boolean; text: string; simulated?: boolean }>("/coach", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
};

export { ApiError };

// 类型定义
export interface User {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  onboardingCompleted?: boolean;
  themePreference?: string;
}

export interface UserData {
  seeds: any[];
  contacts: any[];
  achievements: any[];
  kindnessRipples: any[];
  wisdomItems: any[];
  trajectoryNodes: any[];
  quarterlyGoals: any[];
}
