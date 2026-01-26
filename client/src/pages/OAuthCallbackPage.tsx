// src/pages/OAuthCallbackPage.tsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const userType = searchParams.get("userType");
    const userParam = searchParams.get("user");

    if (token && userType) {
      try {
        // URL 파라미터에 사용자 정보가 있으면 우선 사용
        if (userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            
            console.log("OAuth callback - User data:", user);
            console.log("OAuth callback - Token:", token);
            
            // 인증 정보 저장
            setAuth(
              token,
              user,
              userType as "user" | "company",
              [] // OAuth는 개인 사용자만 지원하므로 companies는 빈 배열
            );

            // 대시보드로 이동
            if (userType === "company") {
              navigate("/company/dashboard");
            } else {
              navigate("/driver/dashboard");
            }
            return;
          } catch (parseError) {
            console.error("Failed to parse user data:", parseError);
            console.error("Raw user param:", userParam);
            throw parseError;
          }
        }

        // 사용자 정보가 없으면 API 호출 (폴백)
        localStorage.setItem("token", token);
        localStorage.setItem("userType", userType);

        authService
          .getCurrentUser()
          .then((response) => {
            setAuth(
              token,
              response.user,
              response.userType,
              response.companies || []
            );

            // 대시보드로 이동
            if (userType === "company") {
              navigate("/company/dashboard");
            } else {
              navigate("/driver/dashboard");
            }
          })
          .catch((error) => {
            console.error("OAuth callback error:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("userType");
            navigate("/login?error=로그인 처리 중 오류가 발생했습니다.");
          });
      } catch (error) {
        console.error("OAuth callback parsing error:", error);
        navigate("/login?error=사용자 정보 처리 중 오류가 발생했습니다.");
      }
    } else {
      navigate("/login?error=인증에 실패했습니다.");
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;

