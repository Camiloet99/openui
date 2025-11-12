import { http } from "./http";

// AUTH
export async function loginApi({ email, password }) {
  return http.post("/auth/login", { email, password });
}
export async function verifyUserIdentityApi({ email, dni }) {
  return http.post("/auth/verify-identity", { email, dni });
}
export async function signupApi({ email, dni, password }) {
  return http.post("/auth/signup", { email, dni, password });
}
export async function resetPasswordApi({ email, dni, newPassword }) {
  return http.post("/auth/reset-password", { email, dni, newPassword });
}

// USERS (me)
export async function getMeApi(token) {
  return http.get("/users/me", { token });
}

export async function updateMeApi(token, patch) {
  return http.put("/users/me", patch, { token });
}