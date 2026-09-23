import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/features/auth/LoginPage";
import FacultyLoginPage from "@/features/auth/FacultyLoginPage";
import AdminLoginPage from "@/features/auth/AdminLoginPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import RegisterPage from "@/features/auth/RegisterPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import ProfilePage from "@/features/profile/ProfilePage";
import ProgramsPage from "@/features/programs/ProgramsPage";
import ProgramDetailPage from "@/features/programs/ProgramDetailPage";
import ApplicationsListPage from "@/features/applications/ApplicationsListPage";
import ApplicationDetailPage from "@/features/applications/ApplicationDetailPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import UsersPage from "@/features/admin/UsersPage";
import FacultyManagementPage from "@/features/admin/FacultyManagementPage";
import AnalyticsPage from "@/features/admin/AnalyticsPage";
import ProgramsManagementPage from "@/features/admin/ProgramsManagementPage";
import ApplicationsManagementPage from "@/features/admin/ApplicationsManagementPage";
import AdminDocumentsPage from "@/features/admin/AdminDocumentsPage";
import BroadcastNotificationsPage from "@/features/admin/BroadcastNotificationsPage";
import SettingsPage from "@/features/admin/SettingsPage";
import FacultyDashboardPage from "@/features/faculty/FacultyDashboardPage";
import AssignedReviewsPage from "@/features/faculty/AssignedReviewsPage";
import ApplicationReviewDetailPage from "@/features/faculty/ApplicationReviewDetailPage";
import FacultyDocumentsPage from "@/features/faculty/FacultyDocumentsPage";
import FacultyProfilePage from "@/features/faculty/FacultyProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/faculty/login", element: <FacultyLoginPage /> },
      { path: "/admin/login", element: <AdminLoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "notifications", element: <NotificationsPage /> },

          // ---- Student ----
          {
            element: <ProtectedRoute allowedRoles={["STUDENT"]} />,
            children: [
              { path: "profile", element: <ProfilePage /> },
              { path: "programs", element: <ProgramsPage /> },
              { path: "programs/:id", element: <ProgramDetailPage /> },
              { path: "applications", element: <ApplicationsListPage /> },
              { path: "applications/:id", element: <ApplicationDetailPage /> },
            ],
          },

          // ---- Faculty (Admin can also act as a reviewer) ----
          {
            element: <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]} />,
            children: [
              { path: "review", element: <AssignedReviewsPage /> },
              { path: "review/:id", element: <ApplicationReviewDetailPage /> },
              { path: "faculty/documents", element: <FacultyDocumentsPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["FACULTY"]} />,
            children: [{ path: "faculty/profile", element: <FacultyProfilePage /> }],
          },

          // ---- Admin ----
          {
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              { path: "users", element: <UsersPage /> },
              { path: "admin/faculty", element: <FacultyManagementPage /> },
              { path: "admin/programs", element: <ProgramsManagementPage /> },
              { path: "admin/applications", element: <ApplicationsManagementPage /> },
              { path: "admin/documents", element: <AdminDocumentsPage /> },
              { path: "admin/notifications", element: <BroadcastNotificationsPage /> },
              { path: "admin/settings", element: <SettingsPage /> },
              { path: "analytics", element: <AnalyticsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
