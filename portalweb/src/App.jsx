// src/App.jsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AuthGateway from "@/pages/Login";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Courses from "@/pages/Courses";
import TestInitial from "@/pages/TestInitial";
import TestExit from "@/pages/TestExit";
import Profile from "@/pages/Profile";
import Experience from "@/pages/Experience";
import NiaChat from "@/pages/NiaChat";

import TermsPrivacyPage from "@/pages/legal/TermsPrivacyPage";
import DataPolicyPage from "@/pages/legal/DataPolicyPage";
import AdminPanel from "@/pages/AdminPanel";
import AdminRoute from "@/routes/AdminRoute";

const router = createBrowserRouter([
  { path: "/login", element: <AuthGateway /> },
  { path: "/legal/terms-privacy", element: <TermsPrivacyPage /> },
  { path: "/legal/data-policy", element: <DataPolicyPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <Navigate to="/courses" replace /> },
          { path: "/courses", element: <Courses /> },
          { path: "/test-inicial", element: <TestInitial /> },
          { path: "/test-salida", element: <TestExit /> },
          { path: "/profile", element: <Profile /> },
          { path: "*", element: <Navigate to="/courses" replace /> },
          { path: "/experience", element: <Experience /> },
          { path: "/chat", element: <NiaChat /> },
          {
            path: "/admin",
            element: (
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            ),
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/courses" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
