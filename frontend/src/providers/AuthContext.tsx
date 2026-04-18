"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: any;
  login: (email: string, pass: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const login = (email: string, pass: string) => {
    console.log("🚀 EasyWork Auth Service:", { email, pass });
    setUser({ email, role: "admin" }); // Giả lập login thành công
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};