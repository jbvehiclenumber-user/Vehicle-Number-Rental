// src/pages/GoogleCallbackPage.tsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (code) {
      // 서버의 구글 콜백 API 호출
      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
      window.location.href = `${API_BASE_URL}/auth/oauth/google/callback?code=${code}`;
    } else {
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

