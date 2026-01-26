import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { COLORS } from "../constants/colors";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userType, token, setAuth } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    businessNumber: "",
    companyName: "",
    representative: "",
    phone: "",
    email: "",
    contactPhone: "",
    currentPassword: "",
    newPassword: "",
  });
  const [showCompanyCurrentPassword, setShowCompanyCurrentPassword] = useState(false);
  const [showCompanyNewPassword, setShowCompanyNewPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!userType) return;
      setIsLoading(true);
      setError("");
      try {
        if (userType === "user") {
          const res = await authService.getCurrentUser();
          if (res.userType === "user") {
            const user = res.user as { name: string; phone: string; email?: string };
            setUserForm({
              name: user.name || "",
              phone: user.phone || "",
              email: user.email || "",
              currentPassword: "",
              newPassword: "",
            });
          }
        } else {
          const res = await authService.getCompanyProfile();
          setCompanyForm({
            businessNumber: res.businessNumber || "",
            companyName: res.companyName || "",
            representative: res.representative || "",
            phone: res.phone || "",
            email: res.email || "",
            contactPhone: res.contactPhone || "",
            currentPassword: "",
            newPassword: "",
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "프로필을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userType]);

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await authService.updateUserProfile({
        name: userForm.name,
        phone: userForm.phone,
        email: userForm.email,
        currentPassword: userForm.newPassword ? userForm.currentPassword : undefined,
        newPassword: userForm.newPassword || undefined,
      });
      if (token) {
        setAuth(token, res.user, "user");
      }
      setUserForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      setSuccess("개인 정보가 저장되었습니다.");
    } catch (err: any) {
      setError(err.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const { businessNumber, currentPassword, newPassword, ...updateData } = companyForm;
      const updated = await authService.updateCompanyProfile({
        ...updateData,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      });
      if (token) {
        setAuth(token, updated, "company");
      }
      setCompanyForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      setSuccess("회사 정보가 저장되었습니다.");
    } catch (err: any) {
      setError(err.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserForm = () => (
    <form onSubmit={handleSubmitUser} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          value={userForm.name}
          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">전화번호</label>
        <input
          type="tel"
          value={userForm.phone}
          onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">이메일</label>
        <input
          type="email"
          value={userForm.email}
          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">비밀번호 변경 (선택)</label>
          <p className="text-xs text-gray-500 mb-2">비밀번호를 변경하려면 기존 비밀번호와 새 비밀번호를 입력하세요.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기존 비밀번호</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={userForm.currentPassword}
              onChange={(e) => setUserForm({ ...userForm, currentPassword: e.target.value })}
              className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
              placeholder="기존 비밀번호 입력"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? (
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={userForm.newPassword}
              onChange={(e) => setUserForm({ ...userForm, newPassword: e.target.value })}
              className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
              placeholder="새 비밀번호 입력"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? (
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
        className="w-full py-3 px-4 text-white rounded-md transition disabled:opacity-50"
        style={{ backgroundColor: COLORS.navy.primary }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = COLORS.navy.hover;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.navy.primary;
        }}
      >
        {isLoading ? "저장 중..." : "저장"}
      </button>
    </form>
  );

  const renderCompanyForm = () => (
    <form onSubmit={handleSubmitCompany} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">사업자등록번호</label>
        <input
          type="text"
          value={companyForm.businessNumber}
          disabled
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">사업자등록번호는 변경할 수 없습니다.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">회사명</label>
          <input
            type="text"
            value={companyForm.companyName}
            onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">대표자명</label>
          <input
            type="text"
            value={companyForm.representative}
            onChange={(e) => setCompanyForm({ ...companyForm, representative: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">전화번호</label>
          <input
            type="tel"
            value={companyForm.phone}
            onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">연락받을 번호</label>
        <input
          type="tel"
          value={companyForm.contactPhone}
          onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="기사들이 연락할 수 있는 번호"
        />
        <p className="mt-1 text-xs text-gray-500">결제 후 기사들이 연락할 수 있는 번호입니다.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">이메일 (선택)</label>
        <input
          type="email"
          value={companyForm.email}
          onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">비밀번호 변경 (선택)</label>
          <p className="text-xs text-gray-500 mb-2">비밀번호를 변경하려면 기존 비밀번호와 새 비밀번호를 입력하세요.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기존 비밀번호</label>
          <div className="relative">
            <input
              type={showCompanyCurrentPassword ? "text" : "password"}
              value={companyForm.currentPassword}
              onChange={(e) => setCompanyForm({ ...companyForm, currentPassword: e.target.value })}
              className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
              placeholder="기존 비밀번호 입력"
            />
            <button
              type="button"
              onClick={() => setShowCompanyCurrentPassword(!showCompanyCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showCompanyCurrentPassword ? (
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
          <div className="relative">
            <input
              type={showCompanyNewPassword ? "text" : "password"}
              value={companyForm.newPassword}
              onChange={(e) => setCompanyForm({ ...companyForm, newPassword: e.target.value })}
              className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
              placeholder="새 비밀번호 입력"
            />
            <button
              type="button"
              onClick={() => setShowCompanyNewPassword(!showCompanyNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showCompanyNewPassword ? (
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
        className="w-full py-3 px-4 text-white rounded-md transition disabled:opacity-50"
        style={{ backgroundColor: COLORS.navy.primary }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = COLORS.navy.hover;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.navy.primary;
        }}
      >
        {isLoading ? "저장 중..." : "저장"}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">프로필 관리</h1>
          <button
            onClick={() =>
              navigate(userType === "company" ? "/company/dashboard" : "/driver/dashboard")
            }
            className="text-sm transition"
            style={{ color: COLORS.navy.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.navy.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.navy.primary)}
          >
            돌아가기
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}

        {isLoading ? (
          <div className="text-gray-600">불러오는 중...</div>
        ) : userType === "company" ? (
          renderCompanyForm()
        ) : (
          renderUserForm()
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

