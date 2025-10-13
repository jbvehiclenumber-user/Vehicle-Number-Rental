// src/pages/SignupPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";

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
    password: "",
    confirmPassword: "",
  });

  // 회사 폼 데이터
  const [companyData, setCompanyData] = useState({
    businessNumber: "",
    companyName: "",
    representative: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [businessVerified, setBusinessVerified] = useState(false);

  const handleVerifyBusiness = async () => {
    if (!companyData.businessNumber) {
      window.alert("사업자등록번호를 입력하세요.");
      return;
    }

    try {
      const isValid = await authService.verifyBusinessNumber(
        companyData.businessNumber
      );
      if (isValid) {
        setBusinessVerified(true);
        window.alert("사업자등록번호 인증이 완료되었습니다.");
      } else {
        window.alert("유효하지 않은 사업자등록번호입니다.");
      }
    } catch (err) {
      window.alert("사업자등록번호 인증에 실패했습니다.");
    }
  };

  const handleUserSignup = async (e: React.FormEvent) => {
    e.preventDefault();

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
        address: companyData.address,
        contactPerson: companyData.contactPerson,
        phone: companyData.phone,
        email: companyData.email,
        password: companyData.password,
      });

      setAuth(response.token, response.user, response.userType);
      navigate("/company/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            기사 회원가입
          </button>
          <button
            onClick={() => setUserType("company")}
            className={`flex-1 py-2 rounded-md font-medium transition ${
              userType === "company"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
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
                비밀번호
              </label>
              <input
                type="password"
                required
                value={userData.password}
                onChange={(e) =>
                  setUserData({ ...userData, password: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                type="password"
                required
                value={userData.confirmPassword}
                onChange={(e) =>
                  setUserData({ ...userData, confirmPassword: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
                주소
              </label>
              <input
                type="text"
                required
                value={companyData.address}
                onChange={(e) =>
                  setCompanyData({ ...companyData, address: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                담당자명
              </label>
              <input
                type="text"
                required
                value={companyData.contactPerson}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    contactPerson: e.target.value,
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
              <input
                type="password"
                required
                value={companyData.password}
                onChange={(e) =>
                  setCompanyData({ ...companyData, password: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                type="password"
                required
                value={companyData.confirmPassword}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    confirmPassword: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !businessVerified}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            이미 계정이 있으신가요? 로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
