// src/components/Header.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userType, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition"
          >
            JUNGBU
          </button>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  회원가입
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition font-medium"
                  aria-label="프로필 수정으로 이동"
                >
                  {userType === "company"
                    ? (user as any)?.companyName
                    : `${(user as any)?.name}님`}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

