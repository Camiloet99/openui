// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, getMeApi, updateMeApi } from "@/services/authService";
import { saveAuthSession, clearAuthSession } from "@/services/session";

const AuthCtx = createContext(null);

// util para leer `exp` del JWT (segundos UNIX)
function decodeJwtExp(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(decodeURIComponent(escape(atob(base64))));
    return json?.exp || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user }
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [logoutTimer, setLogoutTimer] = useState(null);

  // programa logout automático en base al exp
  const scheduleAutoLogout = (token) => {
    if (logoutTimer) clearTimeout(logoutTimer);
    const exp = decodeJwtExp(token);
    if (!exp) return; // si no hay exp, no programamos

    const ms = exp * 1000 - Date.now();
    if (ms <= 0) {
      // ya expiró
      hardLogout();
      return;
    }
    const t = setTimeout(() => {
      // opción A: salir de una
      hardLogout();
      // opción B (si quisieras): pedir /users/me para confirmar y, si 401, salir.
    }, ms - 500); // un pelín antes del exp
    setLogoutTimer(t);
  };

  const saveSession = (data) => {
    setSession(data);
    saveAuthSession(data.token, data.user);
    if (data?.token) scheduleAutoLogout(data.token);
  };

  const hardLogout = () => {
    setSession(null);
    clearAuthSession();
    if (logoutTimer) clearTimeout(logoutTimer);
    // redirige al login
    try {
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    } catch {}
  };

  useEffect(() => {
    const run = async () => {
      try {
        const saved = localStorage.getItem("session");
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!parsed?.token) return;
        const me = await getMeApi(parsed.token);
        saveSession({ token: parsed.token, user: me });
      } catch {
        hardLogout();
      } finally {
        setLoadingAuth(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    function onUnauthorized() {
      hardLogout();
    }
    window.addEventListener("app:unauthorized", onUnauthorized);
    return () => window.removeEventListener("app:unauthorized", onUnauthorized);
  }, []);

  useEffect(() => {
    if (session?.token) scheduleAutoLogout(session.token);
  }, [session?.token]);

  const login = async (email, password) => {
    const { token } = await loginApi({ email, password });
    const user = await getMeApi(token);
    const data = { token, user };
    saveSession(data);
    return data;
  };

  const logout = () => {
    hardLogout();
  };

  const updateUser = async (patch) => {
    if (!session?.token) throw new Error("No hay token en sesión");
    const updated = await updateMeApi(session.token, patch);
    const next = { ...session, user: { ...session.user, ...updated } };
    saveSession(next);
    return next.user;
  };

  const value = useMemo(
    () => ({ session, login, logout, updateUser, loadingAuth }),
    [session, loadingAuth]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
