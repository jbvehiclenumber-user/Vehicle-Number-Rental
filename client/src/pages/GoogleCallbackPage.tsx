// src/pages/GoogleCallbackPage.tsx
import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false); // 중복 처리 방지

  useEffect(() => {
    // React Strict Mode에서 useEffect가 두 번 실행되는 것을 방지
    if (hasProcessed.current) {
      return;
    }

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // 실제로 구글이 리다이렉트한 전체 URL 로깅
    console.log("Google callback - Full URL:", window.location.href);
    console.log("Google callback - Search params:", Object.fromEntries(searchParams.entries()));

    if (error) {
      console.error("Google OAuth error:", error);
      hasProcessed.current = true;
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (code) {
      // 중복 처리 방지
      hasProcessed.current = true;
      
      // 서버의 구글 콜백 API 호출
      // api.ts와 동일한 방식으로 API URL 가져오기
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
      
      // 배포 환경에서 환경 변수가 없으면 경고
      if (!process.env.REACT_APP_API_URL) {
        const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
        if (isProduction) {
          console.warn("REACT_APP_API_URL이 설정되지 않았습니다. 기본값을 사용합니다:", API_BASE_URL);
        }
      }
      
      const callbackUrl = `${API_BASE_URL}/auth/oauth/google/callback?code=${encodeURIComponent(code)}`;
      
      console.log("Google callback - Code received:", code);
      console.log("Google callback - Redirecting to server:", callbackUrl);
      console.log("Google callback - API Base URL:", API_BASE_URL);
      
      // 즉시 서버로 리다이렉트
      window.location.href = callbackUrl;
    } else {
      console.error("No authorization code received from Google");
      hasProcessed.current = true;
      navigate("/login?error=인증 코드가 없습니다.");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">구글 로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;

