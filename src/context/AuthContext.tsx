import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, User, ApiError } from "../lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // 加载时检查 token 或访客模式
  useEffect(() => {
    const token = localStorage.getItem("momentum_token");
    const cachedUser = localStorage.getItem("momentum_user");
    const guestMode = localStorage.getItem("momentum_guest") === "true";

    if (guestMode && !token) {
      setIsGuest(true);
      setUser({
        id: "guest",
        email: "guest@momentum.app",
        name: "访客体验者",
        tier: "guest",
      });
      setLoading(false);
      return;
    }

    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {}
    }

    if (token) {
      api.auth
        .me()
        .then((res) => {
          setUser(res.user);
          localStorage.setItem("momentum_user", JSON.stringify(res.user));
        })
        .catch((err) => {
          if (err instanceof ApiError && err.status === 401) {
            localStorage.removeItem("momentum_token");
            localStorage.removeItem("momentum_user");
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem("momentum_token", res.token);
    localStorage.setItem("momentum_user", JSON.stringify(res.user));
    localStorage.removeItem("momentum_guest");
    setIsGuest(false);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await api.auth.register(email, password, name);
    localStorage.setItem("momentum_token", res.token);
    localStorage.setItem("momentum_user", JSON.stringify(res.user));
    localStorage.removeItem("momentum_guest");
    setIsGuest(false);
    setUser(res.user);
  }, []);

  const loginAsGuest = useCallback(() => {
    localStorage.setItem("momentum_guest", "true");
    setIsGuest(true);
    setUser({
      id: "guest",
      email: "guest@momentum.app",
      name: "访客体验者",
      tier: "guest",
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // 即使后端失败也继续清除本地状态
    }
    localStorage.removeItem("momentum_token");
    localStorage.removeItem("momentum_user");
    localStorage.removeItem("momentum_guest");
    setIsGuest(false);
    setUser(null);
  }, []);

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem("momentum_user", JSON.stringify(newUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isGuest,
        login,
        register,
        loginAsGuest,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
