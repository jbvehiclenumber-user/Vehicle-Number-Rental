// src/pages/VehicleDetailPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vehicleService } from "../services/vehicleService";
import { Vehicle } from "../types/vehicle";
import Header from "../components/Header";
import { COLORS } from "../constants/colors";
import { useAuthStore } from "../stores/authStore";

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const loadVehicle = useCallback(async (vehicleId: string) => {
    setIsLoading(true);
    try {
      const data = await vehicleService.getVehicle(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error("Failed to load vehicle:", error);
      window.alert("차량 정보를 불러오는데 실패했습니다.");
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      loadVehicle(id);
    }
  }, [id, loadVehicle]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div 
          className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: COLORS.navy.primary }}
        ></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">차량 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const phoneToShow = vehicle.company?.contactPhone || vehicle.company?.phone || "";
  const hasContact = Boolean(phoneToShow);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {showLoginRequiredModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowLoginRequiredModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              로그인이 필요합니다
            </h4>
            <p className="text-sm text-gray-600 mb-6">
              정보를 확인하려면 로그인이 필요합니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowLoginRequiredModal(false)}
              >
                닫기
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: COLORS.navy.primary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.navy.hover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.navy.primary)
                }
                onClick={() => navigate("/login")}
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 mb-4"
        >
          ← 뒤로가기
        </button>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Vehicle Header */}
          <div 
            className="text-white p-6"
            style={{ 
              background: `linear-gradient(to right, ${COLORS.navy.primary}, ${COLORS.navy.hover})`
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {vehicle.vehicleNumber}
                </h1>
                <p className="text-gray-200">{vehicle.vehicleType}</p>
              </div>
              <span 
                className="px-3 py-1 bg-white rounded-full text-sm font-semibold"
                style={{ color: COLORS.navy.primary }}
              >
                {vehicle.region}
              </span>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {vehicle.tonnage && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">톤수</span>
                  <span className="font-semibold text-gray-900">
                    {vehicle.tonnage}
                  </span>
                </div>
              )}

              {vehicle.yearModel && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">연식</span>
                  <span className="font-semibold text-gray-900">
                    {vehicle.yearModel}년
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">보험료</span>
                <span className="font-semibold text-gray-900">
                  {vehicle.insuranceRate}%
                </span>
              </div>

              <div 
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: COLORS.navy.light }}
              >
                <span className="text-gray-700 font-medium">월 지입료</span>
                <span className="text-2xl font-bold" style={{ color: COLORS.navy.primary }}>
                  {vehicle.monthlyFee.toLocaleString()}원
                </span>
              </div>
            </div>

            {vehicle.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">추가 정보</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {vehicle.description}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">연락처 정보</h3>

              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                {!isAuthenticated && (
                  <div className="flex items-center justify-center py-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md font-semibold hover:shadow-sm transition text-white"
                      style={{ backgroundColor: COLORS.navy.primary }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = COLORS.navy.hover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = COLORS.navy.primary)
                      }
                      onClick={() => setShowLoginRequiredModal(true)}
                    >
                      자세히 보기
                    </button>
                  </div>
                )}

                {isAuthenticated && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-700">회사명</span>
                      <span className="font-semibold">
                        {vehicle.company?.companyName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">전화번호</span>
                      {!isContactExpanded ? (
                        <button
                          type="button"
                          className="font-semibold hover:underline"
                          style={{ color: COLORS.navy.primary }}
                          onClick={() => setIsContactExpanded(true)}
                        >
                          자세히 보기
                        </button>
                      ) : hasContact ? (
                        <a
                          href={`tel:${phoneToShow}`}
                          className="font-semibold hover:underline"
                          style={{ color: COLORS.navy.primary }}
                        >
                          {phoneToShow}
                        </a>
                      ) : (
                        <span className="font-semibold text-gray-500">-</span>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      {!isContactExpanded ? (
                        <p className="text-sm text-gray-600">
                          연락처는 “자세히 보기”를 눌러 확인할 수 있습니다.
                        </p>
                      ) : hasContact ? (
                        <p className="text-sm text-gray-600">
                          💡 위 번호로 직접 연락하여 상담하실 수 있습니다.
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          연락처 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 직거래 시 반드시 계약서를 작성하세요.</li>
            <li>• 사업자등록증을 확인하고 거래하세요.</li>
            <li>• 불법 수수료 요구 시 신고해주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;
