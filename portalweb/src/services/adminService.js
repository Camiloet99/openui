// src/services/adminService.js
import { http } from "@/services/http";

/**
 * GET /progress/all?page={page}&size={size}
 * Devuelve:
 * {
 *   userList: Array<UserWithExperienceStatusRes>,
 *   totalUsers: number,
 *   page: number,
 *   size: number
 * }
 */
export async function getAdminUsers(page = 0, size = 50) {
  return http.get(`/progress/all?page=${page}&size=${size}`);
}

/**
 * GET /progress/all/export
 * Devuelve: Array<UserWithExperienceStatusRes>
 * (todos los usuarios sin paginación)
 */
export async function exportAdminUsers() {
  return http.get("/progress/all/export");
}
