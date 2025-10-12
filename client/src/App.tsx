// src/App.tsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CompanyDashboard from "./pages/CompanyDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailPage from "./pages/PaymentFailPage";

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredUserType?: "user" | "company";
}> = ({ children, requiredUserType }) => {
  const { isAuthenticated, userType } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 로컬스토리지에서 인증 정보 로드
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes - Company */}
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute requiredUserType="company">
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - User (Driver) */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute requiredUserType="user">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Both */}
        <Route
          path="/vehicle/:id"
          element={
            <ProtectedRoute>
              <VehicleDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Payment Routes */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
