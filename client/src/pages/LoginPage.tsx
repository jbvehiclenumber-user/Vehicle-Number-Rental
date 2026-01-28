// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import Header from "../components/Header";
import { COLORS } from "../constants/colors";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, getDefaultCompanyId, isAuthenticated, userType: currentUserType } = useAuthStore();

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && currentUserType) {
      if (currentUserType === "company") {
        navigate("/company/dashboard", { replace: true });
      } else if (currentUserType === "user") {
        navigate("/driver/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, currentUserType, navigate]);

  const [userType, setUserType] = useState<"user" | "company">("user");
  const [loginIdentifier, setLoginIdentifier] = useState(""); // 전화번호 또는 이메일
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  // URL 파라미터에서 에러 메시지 확인 및 localStorage에서 에러 정보 확인
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
      // URL에서 error 파라미터 제거
      navigate("/login", { replace: true });
    }
    
    // localStorage에서 OAuth 에러 정보 확인
    const oauthErrorInfo = localStorage.getItem("oauth_error_info");
    const oauthDebugInfo = localStorage.getItem("oauth_debug_info");
    
    if (oauthErrorInfo) {
      try {
        const errorData = JSON.parse(oauthErrorInfo);
        console.error("OAuth Error Info (from localStorage):", errorData);
        
        // 에러 상세 정보 저장
        setErrorDetails({
          error: errorData,
          debug: oauthDebugInfo ? JSON.parse(oauthDebugInfo) : null,
        });
        
        // 에러 메시지가 없으면 저장된 에러 정보 사용
        if (!errorParam) {
          setError(errorData.error || "OAuth 로그인 중 오류가 발생했습니다.");
        }
        
        // 디버깅 정보도 함께 로그
        if (oauthDebugInfo) {
          const debugData = JSON.parse(oauthDebugInfo);
          console.log("OAuth Debug Info (from localStorage):", debugData);
        }
      } catch (e) {
        console.error("Failed to parse OAuth error info:", e);
      }
    }
  }, [searchParams, navigate]);

  // 전화번호 포맷팅 함수 (하이픈 자동 추가)
  const formatPhone = (phoneNumber: string): string => {
    const numbers = phoneNumber.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    if (numbers.length <= 11) {
      if (numbers.startsWith("02")) {
        // 서울 지역번호 (02-XXXX-XXXX)
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      } else if (numbers.startsWith("0")) {
        // 일반 전화번호 (0XX-XXXX-XXXX)
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
      }
    }
    return numbers;
  };

  // 이메일 형식 확인
  const checkIfEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetails(null);
    setShowErrorDetails(false);
    // 이전 OAuth 에러 정보 정리
    localStorage.removeItem("oauth_error_info");
    localStorage.removeItem("oauth_debug_info");
    setIsLoading(true);

    try {
      // 입력값이 이메일인지 전화번호인지 확인
      const isEmailInput = checkIfEmail(loginIdentifier);

      // 기본 회사 ID 가져오기 (회사 로그인인 경우)
      const defaultCompanyId = userType === "company" ? getDefaultCompanyId() : undefined;
      
      const response = await authService.login({
        identifier: loginIdentifier, // 전화번호 또는 이메일
        isEmail: isEmailInput,
        password,
        userType,
        defaultCompanyId: defaultCompanyId || undefined,
      });

      console.log("로그인 성공:", response);

      // 응답 데이터 검증
      if (!response || !response.token || !response.user) {
        throw new Error("로그인 응답이 올바르지 않습니다.");
      }

      // 인증 정보 저장 (회사 목록 포함)
      setAuth(
        response.token,
        response.user,
        response.userType,
        response.companies || []
      );

      // 기본 회사 ID가 없고 회사가 여러 개 있으면 첫 번째 회사를 기본으로 설정
      if (userType === "company" && response.companies && response.companies.length > 0) {
        const { getDefaultCompanyId, setDefaultCompanyId } = useAuthStore.getState();
        if (!getDefaultCompanyId()) {
          setDefaultCompanyId(response.companies[0].id);
        }
      }

      // 대시보드로 이동
      if (userType === "company") {
        navigate("/company/dashboard");
      } else {
        navigate("/driver/dashboard");
      }
    } catch (err: any) {
      console.error("로그인 오류:", err);
      let errorMessage = "로그인에 실패했습니다.";
      
      if (err.response) {
        // 서버에서 응답이 온 경우
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        errorMessage = "서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.";
      } else if (err.message) {
        // 기타 에러 메시지
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo & Title */}
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              로그인
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
            영업용 번호 중개 플랫폼
            </p>
          </div>

        {/* User Type Toggle */}
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setUserType("user")}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              userType === "user"
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
            style={userType === "user" ? { color: COLORS.navy.primary } : {}}
          >
            기사 로그인
          </button>
          <button
            onClick={() => setUserType("company")}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              userType === "company"
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
            style={userType === "company" ? { color: COLORS.navy.primary } : {}}
          >
            회사 로그인
          </button>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              <div className="whitespace-pre-wrap">{error}</div>
              {errorDetails && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowErrorDetails(!showErrorDetails);
                      // 상세 정보를 콘솔에도 출력
                      console.error("OAuth Error Details:", errorDetails);
                    }}
                    className="text-sm text-red-700 underline hover:text-red-900"
                  >
                    {showErrorDetails ? "상세 정보 숨기기" : "상세 정보 보기 (콘솔에도 출력됨)"}
                  </button>
                  {showErrorDetails && (
                    <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono overflow-auto max-h-60">
                      <pre className="whitespace-pre-wrap text-red-800">
                        {JSON.stringify(errorDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="loginIdentifier"
                className="block text-sm font-medium text-gray-700"
              >
                전화번호 또는 이메일
              </label>
              <input
                id="loginIdentifier"
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => {
                  const value = e.target.value;
                  // 영문자/@/점이 포함되면 이메일 입력으로 간주하고 그대로 입력
                  // 그렇지 않고 숫자/하이픈만 있으면 전화번호로 간주하여 포맷팅
                  const hasEmailChars = /[a-zA-Z@.]/.test(value);
                  if (hasEmailChars) {
                    setLoginIdentifier(value);
                    return;
                  }

                  // 이메일 특성이 없으면 전화번호로 처리
                  const formatted = formatPhone(value);
                  setLoginIdentifier(formatted);
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                style={{
                  '--tw-ring-color': COLORS.navy.primary,
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.navy.primary;
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 31, 63, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
                placeholder="010-1234-5678 또는 example@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition disabled:opacity-50"
            style={{ backgroundColor: COLORS.navy.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          {/* 비밀번호 찾기 링크 */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {/* 소셜 로그인 구분선 - 기사 로그인일 때만 표시 */}
          {userType === "user" && (
            <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">또는</span>
            </div>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                // 이전 OAuth 에러 정보 정리
                localStorage.removeItem("oauth_error_info");
                localStorage.removeItem("oauth_debug_info");
                setError("");
                setErrorDetails(null);
                
                try {
                  const authUrl = await authService.getKakaoAuthUrl();
                  if (!authUrl) {
                    setError("카카오 인증 URL을 받을 수 없습니다.");
                    return;
                  }
                  window.location.href = authUrl;
                } catch (error: any) {
                  console.error("Kakao OAuth error:", error);
                  const errorMessage = error?.response?.data?.message || error?.message || "카카오 로그인을 시작할 수 없습니다.";
                  setError(errorMessage);
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium transition"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 3.582 0 8c0 2.909 1.938 5.47 4.812 6.93L3.75 20l5.25-2.75C9.5 17.25 9.75 17.25 10 17.25c5.523 0 10-3.582 10-8S15.523 0 10 0z"/>
              </svg>
              카카오로 로그인
            </button>

            <button
              type="button"
              onClick={async () => {
                // 이전 OAuth 에러 정보 정리
                localStorage.removeItem("oauth_error_info");
                localStorage.removeItem("oauth_debug_info");
                setError("");
                setErrorDetails(null);
                
                try {
                  const authUrl = await authService.getGoogleAuthUrl();
                  if (!authUrl) {
                    setError("구글 인증 URL을 받을 수 없습니다.");
                    return;
                  }
                  window.location.href = authUrl;
                } catch (error: any) {
                  console.error("Google OAuth error:", error);
                  const errorMessage = error?.response?.data?.message || error?.message || "구글 로그인을 시작할 수 없습니다.";
                  setError(errorMessage);
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-900 font-medium transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              구글로 로그인
            </button>
          </div>
            </>
          )}

          <div className="text-center space-y-2 mt-6">
            <Link
              to="/signup"
              className="text-sm transition"
              style={{ color: COLORS.navy.primary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.navy.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.navy.primary)}
            >
              회원가입하기
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
