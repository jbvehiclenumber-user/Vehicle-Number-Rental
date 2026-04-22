// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { COLORS } from "../constants/colors";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [isEmail, setIsEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetInfo, setResetInfo] = useState<{ emailSent?: boolean; resetUrl?: string } | null>(null);

  const checkIfEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authService.requestPasswordReset(
        identifier.trim(),
        isEmail
      );

      setResetInfo({ emailSent: (result as any).emailSent, resetUrl: (result as any).resetUrl });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "비밀번호 찾기에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            비밀번호 재설정 링크 전송 완료
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600">
            입력하신 이메일로 비밀번호 재설정 링크를 전송했습니다.
            <br />
            이메일을 확인해주세요.
          </p>

          {resetInfo?.emailSent !== false ? (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ <strong>이메일이 전송되었습니다!</strong>
                <br />
                입력하신 이메일 주소로 비밀번호 재설정 링크를 보냈습니다.
                <br />
                이메일을 확인하시고 링크를 클릭하여 비밀번호를 재설정하세요.
                <br />
                <span className="text-xs text-green-700 mt-2 block">
                  (이메일이 보이지 않으면 스팸함도 확인해주세요)
                </span>
              </p>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                이메일 전송에 실패했습니다. (개발/설정 문제일 수 있습니다)
              </p>
              {resetInfo?.resetUrl && (
                <p className="text-xs text-yellow-900 mt-2 break-all">
                  재설정 링크: {resetInfo.resetUrl}
                </p>
              )}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => navigate("/login")}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition"
              style={{ backgroundColor: COLORS.navy.primary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.navy.hover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.navy.primary)
              }
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          비밀번호 찾기
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          등록하신 전화번호 또는 이메일을 입력해주세요.
          <br />
          비밀번호 재설정 링크를 이메일로 전송해드립니다.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700"
              >
                전화번호 또는 이메일
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  type={isEmail ? "email" : "tel"}
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setIsEmail(checkIfEmail(e.target.value));
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={
                    isEmail
                      ? "example@email.com"
                      : "010-1234-5678"
                  }
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition disabled:opacity-50"
                style={{ backgroundColor: COLORS.navy.primary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.navy.hover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.navy.primary)
                }
              >
                {isLoading ? "전송 중..." : "재설정 링크 전송"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

