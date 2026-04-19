"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getProfile, loginWithEmail, registerWithEmail, AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (fullName: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem("access_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getProfile(storedToken);
        setToken(storedToken);
        setUser(profile);
      } catch {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await loginWithEmail(email, pass);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const signup = async (fullName: string, email: string, pass: string) => {
    await registerWithEmail({
      full_name: fullName,
      email,
      password: pass,
    });

    await login(email, pass);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};