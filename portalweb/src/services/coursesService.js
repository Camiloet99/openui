// src/services/coursesService.js
import { getMyProgress } from "@/services/progressService";

export async function getExperiencesProgress() {
  const p = await getMyProgress();
  return [
    { key: "punto-cero-calma", completed: !!p.medalla1 },
    { key: "bosque-emociones", completed: !!p.medalla2 },
    { key: "jardin-mental",   completed: !!p.medalla3 },
    { key: "lago-suenos",     completed: !!p.medalla4 },
  ];
}
