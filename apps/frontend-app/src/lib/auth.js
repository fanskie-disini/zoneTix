'use client';

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";

// ====== Context Setup ======
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      const token = getAuthToken();
      if (token && !isTokenExpired(token)) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } else {
        clearUserData();
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();

    const handleStorageChange = (e) => {
      if (e.key === "userData" || e.key === "authToken") {
        initializeAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData, token) => {
    try {
      setUserData(userData, token);
      setUser(userData);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    clearUserData();
    setUser(null);
    router.push("/login");
  };

  const updateUser = (updatedData) => {
    const updatedUser = updateUserData(updatedData);
    if (updatedUser) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    getInitials: (firstName, lastName) => getInitials(firstName, lastName),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ====== Utility Functions ======

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("authToken");

    if (!userData || !token) return null;

    return JSON.parse(userData);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");

  return !!(token && userData);
};

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

export const setUserData = (userData, token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("userData", JSON.stringify(userData));
  localStorage.setItem("authToken", token);
};

export const clearUserData = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("userData");
  localStorage.removeItem("authToken");
};

export const updateUserData = (updatedData) => {
  if (typeof window === "undefined") return null;

  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const newUserData = { ...currentUser, ...updatedData };
    localStorage.setItem("userData", JSON.stringify(newUserData));

    return newUserData;
  } catch (error) {
    console.error("Error updating user data:", error);
    return null;
  }
};

export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return first + last || "U";
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

export const checkTokenExpiration = () => {
  const token = getAuthToken();

  if (token && isTokenExpired(token)) {
    clearUserData();
    return false;
  }

  return true;
};

export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();

  if (!token || isTokenExpired(token)) {
    clearUserData();
    throw new Error("Authentication required");
  }

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  };

  return fetch(url, { ...options, ...defaultOptions });
};

export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;

  return user.role === requiredRole || user.roles?.includes(requiredRole);
};

export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user || !user.permissions) return false;

  return user.permissions.includes(permission);
};
