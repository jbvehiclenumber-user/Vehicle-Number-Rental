// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [userType, setUserType] = useState<"user" | "company">("user");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({
        phone,
        password,
        userType,
      });

      // 인증 정보 저장
      setAuth(response.token, response.user, response.userType);

      // 대시보드로 이동
      if (userType === "company") {
        navigate("/company/dashboard");
      } else {
        navigate("/driver/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            기사 로그인
          </button>
          <button
            onClick={() => setUserType("company")}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              userType === "company"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
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
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <div className="text-center">
            <Link
              to="/signup"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              회원가입하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
