import { getAuthToken } from "@/services/session";

// 👉 En dev usas VITE_API_URL; en prod, misma origin (cadena vacía)
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function emitUnauthorized() {
  try {
    window.dispatchEvent(new CustomEvent("app:unauthorized"));
  } catch {}
}

async function request(method, path, body, { token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const authToken = token ?? getAuthToken();
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {}
  }

  if (!res.ok) {
    if (res.status === 401) emitUnauthorized();
    const err = new Error(
      data?.detail || data?.message || `HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const http = {
  get: (p, opts) => request("GET", p, null, opts),
  post: (p, b, opts) => request("POST", p, b, opts),
  put: (p, b, opts) => request("PUT", p, b, opts),
  patch: (p, b, opts) => request("PATCH", p, b, opts),
  del: (p, opts) => request("DELETE", p, null, opts),
};
