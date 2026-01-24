// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import Header from "../components/Header";
import { COLORS } from "../constants/colors";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [userType, setUserType] = useState<"user" | "company">("user");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 전화번호 정규화 함수 (하이픈 제거)
  const normalizePhone = (phoneNumber: string): string => {
    return phoneNumber.replace(/-/g, "");
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 전화번호 정규화 (하이픈 제거)
      const normalizedPhone = normalizePhone(phone);
      console.log("로그인 시도:", { phone: normalizedPhone, userType });
      const response = await authService.login({
        phone: normalizedPhone,
        password,
        userType,
      });

      console.log("로그인 성공:", response);

      // 응답 데이터 검증
      if (!response || !response.token || !response.user) {
        throw new Error("로그인 응답이 올바르지 않습니다.");
      }

      // 인증 정보 저장
      setAuth(response.token, response.user, response.userType);

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
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                전화번호
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setPhone(formatted);
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
                placeholder="010-1234-5678"
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

          <div className="text-center space-y-2">
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
