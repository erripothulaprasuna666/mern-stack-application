import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const login = (userData, authToken) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    if (authToken) {
      setToken(authToken);
      localStorage.setItem("token", authToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const loginDemo = () => {
    const demoUser = {
      _id: "demo-user-123",
      name: "Demo Developer",
      email: "demo@mernflow.dev",
      role: "Lead Fullstack Dev",
    };
    login(demoUser, "demo-mock-jwt-token-xyz");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

