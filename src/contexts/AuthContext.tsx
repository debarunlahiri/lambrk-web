"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { login as apiLogin, register as apiRegister, refreshToken as apiRefreshToken, ApiError, setUnauthorizedHandler, clearUnauthorizedHandler } from "@/lib/api";
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
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lambrk_access_token");
}

function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lambrk_refresh_token");
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

function persistAuth(data: AuthResponse) {
  localStorage.setItem("lambrk_access_token", data.accessToken);
  localStorage.setItem("lambrk_refresh_token", data.refreshToken);
  localStorage.setItem("lambrk_user", JSON.stringify(data.user));
  localStorage.setItem("lambrk_token_expires_at", String(Date.now() + data.expiresIn * 1000));
}

function clearAuth() {
  localStorage.removeItem("lambrk_access_token");
  localStorage.removeItem("lambrk_refresh_token");
  localStorage.removeItem("lambrk_user");
  localStorage.removeItem("lambrk_token_expires_at");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("lambrk:logout"));
  }
}

// ─── Global token refresh coordination ───

let globalRefreshPromise: Promise<AuthResponse | null> | null = null;

async function performRefresh(): Promise<AuthResponse | null> {
  if (globalRefreshPromise) return globalRefreshPromise;

  const refresh = getStoredRefreshToken();
  if (!refresh) {
    clearAuth();
    return null;
  }

  globalRefreshPromise = apiRefreshToken(refresh)
    .then((data) => {
      persistAuth(data);
      return data;
    })
    .catch((err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearAuth();
      }
      return null;
    })
    .finally(() => {
      globalRefreshPromise = null;
    });

  return globalRefreshPromise;
}

export async function refreshSession(): Promise<AuthResponse | null> {
  return performRefresh();
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    const accessToken = localStorage.getItem("lambrk_access_token");
    const refresh = localStorage.getItem("lambrk_refresh_token");
    // Only show loading if there are tokens to verify
    return !!(accessToken || refresh);
  });
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsLoading(false);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback(function scheduleNextRefresh(expiresIn: number) {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    // Refresh at 80% of expiry time to be safe
    const refreshAfter = Math.max(5000, expiresIn * 1000 * 0.8);
    refreshTimerRef.current = setTimeout(async () => {
      const data = await performRefresh();
      if (data) {
        setUser(data.user);
        scheduleNextRefresh(data.expiresIn);
      } else {
        clear();
      }
    }, refreshAfter);
  }, [clear]);

  const persist = useCallback((data: AuthResponse) => {
    persistAuth(data);
    setUser(data.user);
    setIsLoading(false);
    scheduleRefresh(data.expiresIn);
  }, [scheduleRefresh]);

  // Initial auth check
  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (!cancelled) setIsLoading(false);
    };

    const accessToken = getStoredAccessToken();
    const refresh = getStoredRefreshToken();
    const storedUser = getStoredUser();

    if (!accessToken && !refresh) {
      // No tokens at all - definitely not authenticated
      setUser(null);
      finish();
      return;
    }

    if (accessToken && storedUser) {
      // Optimistic: assume valid while we verify in background
      setUser(storedUser);
      finish();
    }

    // Safety: always show UI after 2s even if refresh hangs
    const safetyTimer = setTimeout(finish, 2000);

    // Always try to refresh to get fresh tokens and verify validity
    performRefresh()
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setUser(data.user);
          scheduleRefresh(data.expiresIn);
        } else {
          clear();
        }
      })
      .catch(() => {
        if (!cancelled) clear();
      })
      .finally(() => {
        clearTimeout(safetyTimer);
        finish();
      });

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [clear, scheduleRefresh]);

  // Register unauthorized handler for auto-refresh on 401s
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      const data = await performRefresh();
      if (data) {
        setUser(data.user);
        scheduleRefresh(data.expiresIn);
        return true;
      }
      clear();
      return false;
    });
    return () => {
      clearUnauthorizedHandler();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [clear, scheduleRefresh]);

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

  const handleRefreshSession = useCallback(async (): Promise<boolean> => {
    const data = await performRefresh();
    if (data) {
      setUser(data.user);
      scheduleRefresh(data.expiresIn);
      return true;
    }
    clear();
    return false;
  }, [clear, scheduleRefresh]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshSession: handleRefreshSession,
    }),
    [user, isLoading, login, register, logout, handleRefreshSession]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
