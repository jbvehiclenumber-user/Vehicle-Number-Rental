// src/pages/KakaoCallbackPage.tsx
import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const KakaoCallbackPage: React.FC = () => {
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
    const state = searchParams.get("state");

    // 실제로 카카오가 리다이렉트한 전체 URL 로깅
    console.log("Kakao callback - Full URL:", window.location.href);
    console.log("Kakao callback - Search params:", Object.fromEntries(searchParams.entries()));

    if (error) {
      console.error("Kakao OAuth error:", error);
      hasProcessed.current = true;
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (code) {
      // 중복 처리 방지
      hasProcessed.current = true;
      
      // 서버의 카카오 콜백 API 호출
      // 인증 코드는 매번 새로 생성되며, 일회용이므로 즉시 서버로 전달
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
      const callbackUrl = `${API_BASE_URL}/auth/oauth/kakao/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
      
      console.log("Kakao callback - Code received:", code);
      console.log("Kakao callback - Redirecting to server:", callbackUrl);
      console.log("Kakao callback - Expected redirect URI:", "http://localhost:3000/oauth/kakao/callback");
      
      // 즉시 서버로 리다이렉트 (인증 코드는 매번 새로 생성되므로 문제없음)
      window.location.href = callbackUrl;
    } else {
      console.error("No authorization code received from Kakao");
      hasProcessed.current = true;
      navigate("/login?error=인증 코드가 없습니다.");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default KakaoCallbackPage;

