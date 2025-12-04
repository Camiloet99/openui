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

  const [allUsers, setAllUsers] = useState([]); // 👈 ahora guardamos TODOS + extra
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

        // 🔹 Este endpoint trae TODOS los usuarios del backend
        const backendData = await exportAdminUsers(); // Array<UserWithExperienceStatusRes>

        if (!isMounted) return;

        // 🔹 Combinamos backend + EXTRA_STUDENTS sin duplicar
        const merged = mergeBackendWithExtra(backendData ?? [], EXTRA_STUDENTS);

        setAllUsers(merged);
        setTotalUsers(merged.length);

        // Opcional: reset de página al recargar
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

  // Paginación en frontend: sacamos SOLO la página actual
  const usersPage = useMemo(() => {
    const start = page * size;
    const end = start + size;
    return allUsers.slice(start, end);
  }, [allUsers, page, size]);

  // Métricas globales usando TODOS los usuarios combinados
  const { total, completed, inProgress } = useMemo(() => {
    const total = totalUsers;
    let completed = 0;
    let inProgress = 0;

    allUsers.forEach((u) => {
      const progress = getProgressFromStatus(u.experienceStatus);

      if (progress >= 100) {
        completed += 1;
      } else if (progress > 0) {
        inProgress += 1;
      }
    });

    return { total, completed, inProgress };
  }, [allUsers, totalUsers]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  return (
    <div className="space-y-8">
      {/* Mapa (usa TODOS para el heatmap) */}
      <section className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.7fr)]">
        <div className="order-1 lg:order-2">
          {/* 👇 Le pasamos todos los usuarios combinados */}
          <GeoMapCard users={allUsers} />
        </div>

        {/* Impact summary + slider (también usan TODOS) */}
        <div className="order-2 lg:order-1 flex flex-col gap-6">
          <ImpactSummaryCard
            total={total}
            completed={completed}
            inProgress={inProgress}
          />
          <ParticipationSliderCard users={allUsers} />
        </div>
      </section>

      {/* Tabla paginada: recibe solo la página actual */}
      <section className="hidden md:block">
        <SummaryTableCard
          users={usersPage}      // 👈 solo la página
          loading={loading}
          error={error}
          page={page}
          size={size}
          total={totalUsers}     // 👈 total global combinado
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
}
