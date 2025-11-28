import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verify authentication on mount by checking cookie
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Error parsing stored user:", error);
            localStorage.removeItem("user");
          }
        }

        // Verify token is still valid by calling /me endpoint
        const response = await authService.getCurrentUser();
        if (response && response.success) {
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(response.user));
        } else {
          // Token invalid, clear state
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
      } catch (error) {
        // No valid session, clear state
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Store user data in localStorage (token is in httpOnly cookie)
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear cookie on server
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
