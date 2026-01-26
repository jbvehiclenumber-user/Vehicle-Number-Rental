// src/pages/SignupPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import Header from "../components/Header";
import { COLORS } from "../constants/colors";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [userType, setUserType] = useState<"user" | "company">("user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 개인(기사) 폼 데이터
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showUserConfirmPassword, setShowUserConfirmPassword] = useState(false);

  // 회사 폼 데이터
  const [companyData, setCompanyData] = useState({
    businessNumber: "",
    companyName: "",
    representative: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showCompanyPassword, setShowCompanyPassword] = useState(false);
  const [showCompanyConfirmPassword, setShowCompanyConfirmPassword] = useState(false);

  const [businessVerified, setBusinessVerified] = useState(false);
  const [showContactPhoneModal, setShowContactPhoneModal] = useState(false);
  const [contactPhone, setContactPhone] = useState("");

  // 비밀번호 검증 함수 (8자 이상, 영어와 숫자 포함)
  const validatePassword = (password: string): boolean => {
    if (password.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
  };

  // 개인 사용자 회원가입 버튼 활성화 조건
  const isUserFormValid = () => {
    return (
      userData.name.trim() !== "" &&
      userData.phone.trim() !== "" &&
      userData.email.trim() !== "" &&
      validatePassword(userData.password) &&
      userData.password === userData.confirmPassword &&
      userData.confirmPassword.trim() !== ""
    );
  };

  // 회사 회원가입 버튼 활성화 조건
  const isCompanyFormValid = () => {
    return (
      businessVerified &&
      companyData.businessNumber.trim() !== "" &&
      companyData.companyName.trim() !== "" &&
      companyData.representative.trim() !== "" &&
      companyData.phone.trim() !== "" &&
      validatePassword(companyData.password) &&
      companyData.password === companyData.confirmPassword &&
      companyData.confirmPassword.trim() !== ""
    );
  };

  const handleVerifyBusiness = async () => {
    if (!companyData.businessNumber) {
      setError("사업자등록번호를 입력하세요.");
      return;
    }

    setError("");
    setBusinessVerified(false);

    try {
      const result = await authService.verifyBusinessNumber(
        companyData.businessNumber
      );
      if (result.valid) {
        setBusinessVerified(true);
        setError(""); // 성공 시 에러 메시지 제거
      } else {
        setBusinessVerified(false);
        setError(result.message || "유효하지 않은 사업자등록번호입니다.");
      }
    } catch (err: any) {
      setBusinessVerified(false);
      const errorMessage = err.response?.data?.message || "사업자등록번호 인증에 실패했습니다.";
      setError(errorMessage);
    }
  };

  const handleUserSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData.name.trim() || !userData.phone.trim() || !userData.email.trim() || !userData.password.trim() || !userData.confirmPassword.trim()) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    // 비밀번호 조건 검증
    if (!validatePassword(userData.password)) {
      setError("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await authService.registerUser({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        password: userData.password,
      });

      setAuth(response.token, response.user, response.userType);
      navigate("/driver/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessVerified) {
      setError("사업자등록번호 인증이 필요합니다.");
      return;
    }

    if (
      !companyData.businessNumber.trim() ||
      !companyData.companyName.trim() ||
      !companyData.representative.trim() ||
      !companyData.phone.trim() ||
      !companyData.password.trim() ||
      !companyData.confirmPassword.trim()
    ) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    // 비밀번호 조건 검증
    if (!validatePassword(companyData.password)) {
      setError("비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.");
      return;
    }

    if (companyData.password !== companyData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await authService.registerCompany({
        businessNumber: companyData.businessNumber,
        companyName: companyData.companyName,
        representative: companyData.representative,
        phone: companyData.phone,
        email: companyData.email,
        password: companyData.password,
      });

      setAuth(response.token, response.user, response.userType);
      // 회원가입 성공 후 연락받을 번호 입력 모달 표시
      setShowContactPhoneModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
            <p className="mt-2 text-sm text-gray-600">영업용 번호 중개 플랫폼</p>
          </div>

        {/* User Type Toggle */}
        <div className="flex bg-gray-200 rounded-lg p-1 mb-8">
          <button
            onClick={() => setUserType("user")}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              userType === "user"
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
            style={userType === "user" ? { color: COLORS.navy.primary } : {}}
          >
            기사 회원가입
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
            회사 회원가입
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 기사 회원가입 폼 */}
        {userType === "user" && (
          <form
            onSubmit={handleUserSignup}
            className="bg-white shadow-md rounded-lg p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                required
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                type="tel"
                required
                value={userData.phone}
                onChange={(e) =>
                  setUserData({ ...userData, phone: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                required
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showUserPassword ? "text" : "password"}
                  required
                  value={userData.password}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                  placeholder="8자 이상, 영어와 숫자 포함"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showUserPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showUserPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showUserConfirmPassword ? "text" : "password"}
                  required
                  value={userData.confirmPassword}
                  onChange={(e) =>
                    setUserData({ ...userData, confirmPassword: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowUserConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showUserConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showUserConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {userData.password && !validatePassword(userData.password) && (
                <p className="mt-1 text-xs text-red-500">
                  비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.
                </p>
              )}
              {userData.password && userData.confirmPassword && userData.password !== userData.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isUserFormValid()}
              className={`w-full py-3 px-4 rounded-md transition ${
                isUserFormValid() && !isLoading
                  ? "text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              style={
                isUserFormValid() && !isLoading
                  ? { backgroundColor: COLORS.navy.primary }
                  : {}
              }
              onMouseEnter={(e) => {
                if (isUserFormValid() && !isLoading) {
                  e.currentTarget.style.backgroundColor = COLORS.navy.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (isUserFormValid() && !isLoading) {
                  e.currentTarget.style.backgroundColor = COLORS.navy.primary;
                }
              }}
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </button>
          </form>
        )}

        {/* 회사 회원가입 폼 */}
        {userType === "company" && (
          <form
            onSubmit={handleCompanySignup}
            className="bg-white shadow-md rounded-lg p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                사업자등록번호
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={companyData.businessNumber}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      businessNumber: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="123-45-67890"
                  disabled={businessVerified}
                />
                <button
                  type="button"
                  onClick={handleVerifyBusiness}
                  disabled={businessVerified}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {businessVerified ? "인증완료" : "인증"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                회사명
              </label>
              <input
                type="text"
                required
                value={companyData.companyName}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    companyName: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                대표자명
              </label>
              <input
                type="text"
                required
                value={companyData.representative}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    representative: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                type="tel"
                required
                value={companyData.phone}
                onChange={(e) =>
                  setCompanyData({ ...companyData, phone: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                이메일 (선택)
              </label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) =>
                  setCompanyData({ ...companyData, email: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showCompanyPassword ? "text" : "password"}
                  required
                  value={companyData.password}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, password: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                  placeholder="8자 이상, 영어와 숫자 포함"
                />
                <button
                  type="button"
                  onClick={() => setShowCompanyPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showCompanyPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showCompanyPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showCompanyConfirmPassword ? "text" : "password"}
                  required
                  value={companyData.confirmPassword}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowCompanyConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showCompanyConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showCompanyConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {companyData.password && !validatePassword(companyData.password) && (
                <p className="mt-1 text-xs text-red-500">
                  비밀번호는 8자 이상이며 영어와 숫자를 포함해야 합니다.
                </p>
              )}
              {companyData.password && companyData.confirmPassword && companyData.password !== companyData.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isCompanyFormValid()}
              className={`w-full py-3 px-4 rounded-md transition ${
                isCompanyFormValid() && !isLoading
                  ? "text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              style={
                isCompanyFormValid() && !isLoading
                  ? { backgroundColor: COLORS.navy.primary }
                  : {}
              }
              onMouseEnter={(e) => {
                if (isCompanyFormValid() && !isLoading) {
                  e.currentTarget.style.backgroundColor = COLORS.navy.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (isCompanyFormValid() && !isLoading) {
                  e.currentTarget.style.backgroundColor = COLORS.navy.primary;
                }
              }}
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm transition"
            style={{ color: COLORS.navy.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.navy.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.navy.primary)}
          >
            이미 계정이 있으신가요? 로그인하기
          </Link>
        </div>
        </div>
      </div>

      {/* 연락받을 번호 입력 모달 */}
      {showContactPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">기사들께 연락받을 번호를 입력하세요</h2>
            <p className="text-gray-600 mb-4">
              결제 후 기사들이 연락할 수 있는 번호를 입력해주세요.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락받을 번호
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="010-1234-5678"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!contactPhone.trim()) {
                    setError("연락받을 번호를 입력해주세요.");
                    return;
                  }
                  try {
                    await authService.updateContactPhone(contactPhone);
                    setShowContactPhoneModal(false);
                    setIsLoading(false);
                    navigate("/company/dashboard");
                  } catch (err: any) {
                    setError(err.response?.data?.message || "번호 저장에 실패했습니다.");
                  }
                }}
                className="w-full py-2 px-4 text-white rounded-md transition"
                style={{ backgroundColor: COLORS.navy.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
