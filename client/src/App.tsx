// src/App.tsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import KakaoCallbackPage from "./pages/KakaoCallbackPage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CompanyDashboard from "./pages/CompanyDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailPage from "./pages/PaymentFailPage";
import ProfilePage from "./pages/ProfilePage";

// Components
import InstallPrompt from "./components/InstallPrompt";

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
      <InstallPrompt />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/oauth/kakao/callback" element={<KakaoCallbackPage />} />
        <Route path="/oauth/google/callback" element={<GoogleCallbackPage />} />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

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
