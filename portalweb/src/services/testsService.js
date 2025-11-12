// src/services/testsService.js
import { http } from "@/services/http";

export async function submitInitialTest(_payload) {
  await http.post("/progress/me/tests", { kind: "test-inicial" });
  return { ok: true };
}

export async function submitExitTest(_payload) {
  await http.post("/progress/me/tests", { kind: "test-salida" });
  return { ok: true };
}