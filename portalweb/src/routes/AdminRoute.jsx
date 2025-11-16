// src/routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({ children }) {
  const { session, loadingAuth } = useAuth();

  if (loadingAuth) return null; // o spinner global

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session?.user?.role !== "ADMIN") {
    return <Navigate to="/courses" replace />;
  }

  return children;
}
