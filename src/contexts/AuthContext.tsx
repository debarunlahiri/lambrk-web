"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { login as apiLogin, register as apiRegister, refreshToken, ApiError } from "@/lib/api";
import type { AuthResponse } from "@/lib/api";

interface AuthContextValue {
  user: AuthResponse["user"] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function getStoredUser(): AuthResponse["user"] | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("lambrk_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse["user"] | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("lambrk_refresh_token");
  });

  const persist = useCallback((data: AuthResponse) => {
    localStorage.setItem("lambrk_access_token", data.accessToken);
    localStorage.setItem("lambrk_refresh_token", data.refreshToken);
    localStorage.setItem("lambrk_user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem("lambrk_access_token");
    localStorage.removeItem("lambrk_refresh_token");
    localStorage.removeItem("lambrk_user");
    setUser(null);
  }, []);

  useEffect(() => {
    const storedRefresh = localStorage.getItem("lambrk_refresh_token");
    if (!storedRefresh) return;
    refreshToken(storedRefresh)
      .then(persist)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          clear();
        } else {
          clear();
        }
      })
      .finally(() => setIsLoading(false));
  }, [persist, clear]);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await apiLogin({ username, password });
      persist(data);
    },
    [persist]
  );

  const register = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      displayName: string;
    }) => {
      const res = await apiRegister(data);
      persist(res);
    },
    [persist]
  );

  const logout = useCallback(() => {
    clear();
  }, [clear]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
