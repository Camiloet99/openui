// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute() {
  const { session, loadingAuth } = useAuth();
  const location = useLocation();

  // Splash mientras validamos sesión guardada
  if (loadingAuth) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        Cargando…
      </div>
    );
  }

  // Si no hay token, redirige a /login y guarda desde dónde veníamos
  if (!session?.token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Autenticado: renderiza las rutas hijas
  return <Outlet />;
}
