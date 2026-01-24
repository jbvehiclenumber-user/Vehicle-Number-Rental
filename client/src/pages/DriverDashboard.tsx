// src/pages/DriverDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { vehicleService } from "../services/vehicleService";
import { Vehicle, VehicleFilter } from "../types/vehicle";
import Header from "../components/Header";
import { COLORS } from "../constants/colors";

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<VehicleFilter>({
    region: searchParams.get("region") || undefined,
  });

  const regions = ["서울", "경기", "강원", "충청", "전라", "경상"];

  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vehicleService.getVehicles(filter);
      setVehicles(data);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleVehicleClick = (vehicleId: string) => {
    navigate(`/vehicle/${vehicleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="기사 대시보드" />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">검색 필터</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 지역 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역
              </label>
              <select
                value={filter.region || ""}
                onChange={(e) =>
                  setFilter({ ...filter, region: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* 지입료 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 지입료
              </label>
              <input
                type="number"
                value={filter.maxFee || ""}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    maxFee: Number(e.target.value) || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="예: 300000"
              />
            </div>
          </div>

          <button
            onClick={() => setFilter({})}
            className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            필터 초기화
          </button>
        </div>

        {/* Vehicle List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            등록된 차량 번호 ({vehicles.length}건)
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div 
                className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: COLORS.navy.primary }}
              ></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">등록된 차량이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => handleVehicleClick(vehicle.id)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.vehicleNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {vehicle.vehicleType}
                      </p>
                    </div>
                    <span 
                      className="px-2 py-1 text-xs rounded"
                      style={{ backgroundColor: COLORS.navy.light, color: COLORS.navy.primary }}
                    >
                      {vehicle.region}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {vehicle.tonnage && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">톤수</span>
                        <span className="font-medium">{vehicle.tonnage}</span>
                      </div>
                    )}
                    {vehicle.yearModel && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">연식</span>
                        <span className="font-medium">
                          {vehicle.yearModel}년
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">보험료</span>
                      <span className="font-medium">
                        {vehicle.insuranceRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-gray-900 font-semibold">
                        월 지입료
                      </span>
                      <span className="font-bold" style={{ color: COLORS.navy.primary }}>
                        {vehicle.monthlyFee.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <button
                    className="mt-4 w-full py-2 text-white rounded-md transition"
                    style={{ backgroundColor: COLORS.navy.primary }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVehicleClick(vehicle.id);
                    }}
                  >
                    상세보기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
