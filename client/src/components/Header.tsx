// src/components/Header.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { COLORS } from "../constants/colors";

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
            className="text-2xl font-bold text-gray-900 transition"
            style={{ '--hover-color': COLORS.navy.primary } as React.CSSProperties}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.navy.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
          >
           에스에이치
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
                  className="px-4 py-2 text-white rounded-lg transition"
                  style={{ backgroundColor: COLORS.navy.primary }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
                >
                  회원가입
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-3 py-2 text-gray-700 rounded-md transition font-medium"
                  style={{ '--hover-color': COLORS.navy.primary } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.navy.primary;
                    e.currentTarget.style.backgroundColor = '#f0f4f8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
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

