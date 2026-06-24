import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { normalizeUser } from "../utils/user";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");

      // No token at all — try refresh cookie
      if (!token) {
        await tryRefresh();
        return;
      }

      // Has token — try to get user
      try {
        const { data } = await api.get("/auth/me");
        setUser(normalizeUser(data.user));
      } catch {
        // Token likely expired — try to refresh
        await tryRefresh();
      } finally {
        setLoading(false);
      }
    };

    const tryRefresh = async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        localStorage.setItem("accessToken", data.accessToken);

        const { data: userData } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        setUser(normalizeUser(userData.user));
      } catch {
        // Refresh token also expired — user must log in again
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (username, email, password) => {
    const { data } = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(normalizeUser(data.user));
  };

  const login = async (email, password) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/api/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    );
    localStorage.setItem("accessToken", data.accessToken);
    setUser(normalizeUser(data.user));
  };

  const googleLogin = async (creds) => {
    const { data } = await api.post("/auth/google", {
      credential: creds.credential,
    });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(normalizeUser(data.user));
  };

  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
