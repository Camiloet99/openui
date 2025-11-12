import { http } from "@/services/http";
import { getAuthToken } from "@/services/session";

// GET /progress/me  -> { medals..., testInitialDone, testExitDone }
export async function getMyProgress() {
  const token = getAuthToken();
  return http.get("/progress/me", { token });
}

// POST /progress/me/tests  body: { kind: "test-inicial" | "test-salida" }
export async function submitTest(kind) {
  const token = getAuthToken();
  return http.post("/progress/me/tests", { kind }, { token });
}

// PATCH /progress/me/medals  body: { medalla1?, medalla2?, medalla3?, medalla4? } (booleanos)
export async function patchMyMedals(patch) {
  const token = getAuthToken();
  return http.patch("/progress/me/medals", patch, { token });
}
