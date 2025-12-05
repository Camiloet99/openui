// src/pages/AdminPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ImpactSummaryCard from "@/components/admin/ImpactSummaryCard";
import ParticipationSliderCard from "@/components/admin/ParticipationSliderCard";
import GeoMapCard from "@/components/admin/GeoMapCard";
import SummaryTableCard from "@/components/admin/SummaryTableCard";
import { exportAdminUsers } from "@/services/adminService";
import { EXTRA_STUDENTS } from "@/data/extraStudents";

// Helper para interpretar experienceStatus (numérico o legacy string)
function getProgressFromStatus(rawStatus) {
  if (typeof rawStatus === "number" && !Number.isNaN(rawStatus)) {
    return Math.min(Math.max(rawStatus, 0), 100);
  }
  if (typeof rawStatus === "string") {
    const parsed = parseInt(rawStatus, 10);
    if (!Number.isNaN(parsed)) {
      return Math.min(Math.max(parsed, 0), 100);
    }
  }
  if (rawStatus === "complete") return 100;
  if (rawStatus === "progress") return 60;
  return 0;
}

// 🔹 Correos administrativos explícitos
const ADMIN_EMAIL_SET = new Set(
  [
    "benavideznaida@gmail.com",
    "camilo@gmail.com",
    "hahnahhernandez396@gmail.com",
    "luis.vargas@iudigital.edu.co",
    "uriel.osorio@iudigital.edu.co",
    "isabellacasasperez1@gmail.com",
    "julia.puerta@iudigital.edu.co",
    "wilmer.medina@iudigital.edu.co",
    "iudigital.isabelcastro@gmail.com",
    "rabedoya551@gmail.com",
    "sados20222@gmail.com",
  ].map((e) => e.toLowerCase())
);

// 🔹 Regla para marcar si un usuario es administrativo
function isAdminUser(user) {
  const email = (user?.email || "").trim().toLowerCase();
  if (!email) return false;

  if (ADMIN_EMAIL_SET.has(email)) return true;

  // Todos los que sean @iudigital.edu.co (pero NO @est.iudigital.edu.co) se consideran administrativos
  if (
    email.endsWith("@iudigital.edu.co") &&
    !email.endsWith("@est.iudigital.edu.co")
  ) {
    return true;
  }

  return false;
}

function mergeBackendWithExtra(backendUsers = [], extraStudents = []) {
  const byEmail = new Map();

  backendUsers.forEach((u) => {
    if (!u?.email) return;
    byEmail.set(u.email.toLowerCase(), { ...u });
  });

  extraStudents.forEach((extra) => {
    const email = extra.email?.toLowerCase();
    if (!email) return;

    if (byEmail.has(email)) {
      const current = byEmail.get(email);
      byEmail.set(email, {
        ...current,
        ...extra,
        experienceStatus:
          extra.experienceStatus ?? current.experienceStatus ?? 0,
      });
    } else {
      byEmail.set(email, { ...extra });
    }
  });

  return Array.from(byEmail.values());
}

export default function AdminPanel() {
  const { session } = useAuth();

  const [allUsers, setAllUsers] = useState([]); // TODOS (estudiantes + admin)
  const [totalUsers, setTotalUsers] = useState(0);

  const [page, setPage] = useState(0); // paginación solo frontend
  const [size, setSize] = useState(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga de datos (una sola vez) usando el endpoint que trae TODO
  useEffect(() => {
    if (!session?.token) return;

    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const backendData = await exportAdminUsers(); // Array<UserWithExperienceStatusRes>

        if (!isMounted) return;

        const merged = mergeBackendWithExtra(backendData ?? [], EXTRA_STUDENTS);

        setAllUsers(merged);
        setTotalUsers(merged.length);
        setPage(0);
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || "Error al cargar datos");
        setAllUsers([]);
        setTotalUsers(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [session?.token]);

  // 🔹 Participantes reales (sin administrativos) para estadísticas
  const participants = useMemo(
    () => allUsers.filter((u) => !isAdminUser(u)),
    [allUsers]
  );

  // Paginación en frontend: la tabla muestra TODOS (incluye administrativos)
  const usersPage = useMemo(() => {
    const start = page * size;
    const end = start + size;
    return allUsers.slice(start, end);
  }, [allUsers, page, size]);

  // Métricas globales usando SOLO participantes (sin admin)
  const { total, completed, inProgress } = useMemo(() => {
    const total = participants.length;
    let completed = 0;
    let inProgress = 0;

    participants.forEach((u) => {
      const progress = getProgressFromStatus(u.experienceStatus);

      if (progress >= 100) {
        completed += 1;
      } else {
        inProgress += 1;
      }
    });

    return { total, completed, inProgress };
  }, [participants]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  return (
    <div className="space-y-8">
      {/* Mapa: aquí puedes decidir si quieres incluir admin o no.
          Ahora mismo usa TODOS (allUsers). */}
      <section className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.7fr)]">
        <div className="order-1 lg:order-2">
          <GeoMapCard users={allUsers} />
          {/* Si quieres excluir admin del mapa, cambia a:
              <GeoMapCard users={participants} />
          */}
        </div>

        {/* Impact summary + slider → usan SOLO participantes (sin admin) */}
        <div className="order-2 lg:order-1 flex flex-col gap-6">
          <ImpactSummaryCard
            total={total}
            completed={completed}
            inProgress={inProgress}
          />
          <ParticipationSliderCard users={participants} />
        </div>
      </section>

      {/* Tabla paginada: muestra TODOS, incluyendo administrativos */}
      <section className="hidden md:block">
        <SummaryTableCard
          users={usersPage}
          loading={loading}
          error={error}
          page={page}
          size={size}
          total={totalUsers}
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
}
