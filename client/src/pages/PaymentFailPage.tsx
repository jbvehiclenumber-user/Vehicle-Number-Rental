// src/pages/PaymentFailPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../constants/colors";

const PaymentFailPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          결제에 실패했습니다
        </h1>
        
        <p className="text-gray-600 mb-6">
          결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full text-white py-2 px-4 rounded-lg transition"
            style={{ backgroundColor: COLORS.navy.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
          >
            다시 시도
          </button>
          
          <button
            onClick={() => navigate("/driver/dashboard")}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailPage;
