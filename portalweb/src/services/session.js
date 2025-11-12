// Guarda y lee la sesión (token + user) desde localStorage

const KEY = "session";

/** Devuelve el JWT actual o null si no hay sesión */
export function getAuthToken() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const sess = JSON.parse(raw);
    return sess?.token ?? null;
  } catch {
    return null;
  }
}

/** Devuelve el usuario actual o null */
export function getAuthUser() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const sess = JSON.parse(raw);
    return sess?.user ?? null;
  } catch {
    return null;
  }
}

/** Persiste token+user */
export function saveAuthSession(token, user) {
  localStorage.setItem(KEY, JSON.stringify({ token, user }));
}

/** Limpia sesión */
export function clearAuthSession() {
  localStorage.removeItem(KEY);
}
