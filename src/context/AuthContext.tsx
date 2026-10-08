"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { IUser, UserRole } from "@/types";

interface AuthContextType {
  user: IUser | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (userData: IUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pj_user_session");
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pj_user_session");
        if (stored) return false;
      } catch {
        // ignore
      }
    }
    return true;
  });

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("pj_user_session", JSON.stringify(data.user));
            } catch {
              // ignore
            }
          }
          return;
        }
      }
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("pj_user_session");
      }
    } catch {
      // Don't log out if it was just a temporary network hiccup and cached user exists
      if (!user) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback((userData: IUser) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pj_user_session", JSON.stringify(userData));
      } catch {
        // ignore
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request error", e);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("pj_user_session");
      }
      window.location.href = "/";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        login,
        logout,
        refreshUser: fetchCurrentUser,
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
