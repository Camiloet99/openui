// src/pages/AdminPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminUsers } from "@/services/adminService";

import ImpactSummaryCard from "@/components/admin/ImpactSummaryCard";
import ParticipationSliderCard from "@/components/admin/ParticipationSliderCard";
import GeoMapCard from "@/components/admin/GeoMapCard";
import SummaryTableCard from "@/components/admin/SummaryTableCard";

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

        // Por si el backend ajusta page/size
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

  // Métricas globales
  // total viene del backend (totalUsers), completed/inProgress sobre la página actual
  const { total, completed, inProgress } = useMemo(() => {
    const total = totalUsers;
    const completed = users.filter((u) => u.experienceStatus === "complete")
      .length;
    const inProgress = (users?.length ?? 0) - completed;
    return { total, completed, inProgress };
  }, [users, totalUsers]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  return (
    <div className="space-y-8">
      {/* Arriba: métricas + slider / mapa */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.7fr)]">
        {/* Columna izquierda (Impact + slider) */}
        <div className="flex flex-col gap-6">
          <ImpactSummaryCard
            total={total}
            completed={completed}
            inProgress={inProgress}
          />

          <ParticipationSliderCard users={users} />
        </div>

        {/* Columna derecha: mapa (más ancho) */}
        <GeoMapCard />
      </section>

      {/* Abajo: tabla paginada */}
      <SummaryTableCard
        users={users}
        loading={loading}
        error={error}
        page={page}
        size={size}
        total={totalUsers}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
