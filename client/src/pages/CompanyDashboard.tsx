// src/pages/CompanyDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { vehicleService } from "../services/vehicleService";
import { Vehicle, VehicleFormData } from "../types/vehicle";

const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleNumber: "",
    vehicleType: "택시",
    tonnage: "",
    yearModel: undefined,
    region: "서울",
    insuranceRate: 100,
    monthlyFee: 250000,
    description: "",
  });

  const regions = ["서울", "경기", "강원", "충청", "전라", "경상"];
  const vehicleTypes = ["택시", "화물차", "버스", "기타"];

  useEffect(() => {
    loadMyVehicles();
  }, []);

  const loadMyVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
      window.alert("차량 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVehicle) {
        // 수정
        await vehicleService.updateVehicle(editingVehicle.id, formData);
        window.alert("차량 정보가 수정되었습니다.");
      } else {
        // 등록
        await vehicleService.createVehicle(formData);
        window.alert("차량이 등록되었습니다.");
      }

      // 폼 초기화 및 목록 새로고침
      resetForm();
      loadMyVehicles();
    } catch (error: any) {
      window.alert(error.response?.data?.message || "저장에 실패했습니다.");
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      tonnage: vehicle.tonnage || "",
      yearModel: vehicle.yearModel,
      region: vehicle.region,
      insuranceRate: vehicle.insuranceRate,
      monthlyFee: vehicle.monthlyFee,
      description: vehicle.description || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    try {
      await vehicleService.deleteVehicle(vehicleId);
      window.alert("차량이 삭제되었습니다.");
      loadMyVehicles();
    } catch (error) {
      window.alert("삭제에 실패했습니다.");
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleNumber: "",
      vehicleType: "택시",
      tonnage: "",
      yearModel: undefined,
      region: "서울",
      insuranceRate: 100,
      monthlyFee: 250000,
      description: "",
    });
    setEditingVehicle(null);
    setShowAddForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">회사 대시보드</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {(user as any)?.companyName}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Add Vehicle Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            {showAddForm ? "취소" : "+ 차량 등록"}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingVehicle ? "차량 수정" : "차량 등록"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  차량번호 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="12가3456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  차종 *
                </label>
                <select
                  required
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  톤수
                </label>
                <input
                  type="text"
                  value={formData.tonnage}
                  onChange={(e) =>
                    setFormData({ ...formData, tonnage: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="1톤, 2.5톤 등"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연식
                </label>
                <input
                  type="number"
                  value={formData.yearModel || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearModel: Number(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  지역 *
                </label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  보험료 (%) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.insuranceRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      insuranceRate: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  월 지입료 (원) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.monthlyFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyFee: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="250000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  추가 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="차량에 대한 추가 정보를 입력하세요"
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingVehicle ? "수정" : "등록"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicle List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            등록한 차량 ({vehicles.length}건)
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">등록된 차량이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">
                위의 버튼을 클릭하여 차량을 등록하세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-lg shadow-md p-6"
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
                      className={`px-2 py-1 text-xs rounded ${
                        vehicle.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {vehicle.isAvailable ? "이용가능" : "이용중"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">지역</span>
                      <span className="font-medium">{vehicle.region}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">월 지입료</span>
                      <span className="font-medium">
                        {vehicle.monthlyFee.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
