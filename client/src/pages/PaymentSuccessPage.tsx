// src/pages/PaymentSuccessPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../constants/colors";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          결제가 완료되었습니다!
        </h1>

        <p className="text-gray-600 mb-6">
          연락처 정보가 공개되었습니다. 이제 해당 회사에 직접 연락하실 수
          있습니다.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/driver/dashboard")}
            className="w-full text-white py-2 px-4 rounded-lg transition"
            style={{ backgroundColor: COLORS.navy.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
          >
            대시보드로 이동
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
