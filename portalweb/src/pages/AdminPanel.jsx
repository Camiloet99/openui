// src/pages/AdminPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminUsers } from "@/services/adminService";

import ImpactSummaryCard from "@/components/admin/ImpactSummaryCard";
import ParticipationSliderCard from "@/components/admin/ParticipationSliderCard";
import GeoMapCard from "@/components/admin/GeoMapCard";
import SummaryTableCard from "@/components/admin/SummaryTableCard";

// Helper para interpretar experienceStatus (numérico o legacy string)
function getProgressFromStatus(rawStatus) {
  // Nuevo formato: número 0–100
  if (typeof rawStatus === "number" && !Number.isNaN(rawStatus)) {
    return Math.min(Math.max(rawStatus, 0), 100);
  }

  // Por si llegara como string numérica
  if (typeof rawStatus === "string") {
    const parsed = parseInt(rawStatus, 10);
    if (!Number.isNaN(parsed)) {
      return Math.min(Math.max(parsed, 0), 100);
    }
  }

  // Compatibilidad hacia atrás
  if (rawStatus === "complete") return 100;
  if (rawStatus === "progress") return 60;

  return 0;
}

export default function AdminPanel() {
  const { session } = useAuth();

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga de datos paginada
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminUsers(page, size);

        if (!isMounted) return;

        setUsers(data?.userList ?? []);
        setTotalUsers(data?.totalUsers ?? 0);

        if (typeof data?.page === "number") {
          setPage(data.page);
        }
        if (typeof data?.size === "number") {
          setSize(data.size);
        }
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || "Error al cargar datos");
        setUsers([]);
        setTotalUsers(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (session?.token) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [session?.token, page, size]);

  // Métricas globales usando el porcentaje real
  const { total, completed, inProgress } = useMemo(() => {
    const total = totalUsers;
    let completed = 0;
    let inProgress = 0;

    users.forEach((u) => {
      const progress = getProgressFromStatus(u.experienceStatus);

      if (progress >= 100) {
        completed += 1;
      } else if (progress > 0) {
        inProgress += 1;
      }
    });

    return { total, completed, inProgress };
  }, [users, totalUsers]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  return (
    <div className="space-y-8">
      {/* Layout responsivo:
          - Mobile: columna → Mapa (1), Impact (2), Slider (3)
          - Desktop (lg): grid 2 columnas → Izq (Impact+Slider), Der (Mapa)
      */}
      <section className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.7fr)]">
        {/* Mapa */}
        <div className="order-1 lg:order-2">
          <GeoMapCard users={users} />
        </div>

        {/* Impact summary + slider */}
        <div className="order-2 lg:order-1 flex flex-col gap-6">
          <ImpactSummaryCard
            total={total}
            completed={completed}
            inProgress={inProgress}
          />
          <ParticipationSliderCard users={users} />
        </div>
      </section>

      {/* Tabla paginada: oculta en mobile, visible desde md */}
      <section className="hidden md:block">
        <SummaryTableCard
          users={users}
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
