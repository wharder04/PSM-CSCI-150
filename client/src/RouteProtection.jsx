import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import SetPassword from "./pages/auth/Setpassword.jsx";
import Verfication from "./pages/auth/Verification.jsx";
import Login from "./pages/auth/Login.jsx";
import Landing from "./pages/auth/Landing.jsx";
import AccountCreate from "./pages/auth/AccountCreate.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ProjectsPage from "./pages/projects/ProjectsPage.jsx";
import ProjectDetailsPage from "./pages/projects/ProjectDetailsPage.jsx";
import Dashboard from "./pages/dashboard/DashboardPage.jsx";
import TaskBoard from "./pages/TaskBoard/TaskBoard.jsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout.jsx";

const RouteProtection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/auth/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
      />
      <Route
        path="/auth/register"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <AccountCreate />
        }
      />
      <Route
        path="/auth/forgot"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <ForgotPassword />
        }
      />
      <Route
        path="/auth/verify"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Verfication />
        }
      />
      <Route
        path="/auth/reset"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <SetPassword />
        }
      />
      <Route
        path="/home"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
      <Route
        path="/projects"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <ProjectsPage />
            </DashboardLayout>
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <ProjectDetailsPage />
            </DashboardLayout>
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
      <Route
        path="/tasks"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <TaskBoard />
            </DashboardLayout>
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default RouteProtection;
