// src/pages/CompanyDashboard.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { vehicleService } from "../services/vehicleService";
import { Vehicle, VehicleFormData } from "../types/vehicle";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { Company } from "../types/user";
import Header from "../components/Header";
import CustomSelect from "../components/CustomSelect";
import { COLORS } from "../constants/colors";

// 회사 전환 비밀번호 확인 모달
const CompanySwitchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  onSuccess: () => void;
}> = ({ isOpen, onClose, company, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.switchCompany(company.id, password);
      const { setAuth } = useAuthStore.getState();
      setAuth(
        response.token,
        response.user,
        response.userType,
        useAuthStore.getState().companies
      );
      onSuccess();
      onClose();
      setPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "회사 전환에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">회사 전환</h2>
        <p className="text-gray-600 mb-4">
          <strong>{company.companyName}</strong>으로 전환하려면 비밀번호를 입력해주세요.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호를 입력하세요"
              required
              autoFocus
            />
          </div>
          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md transition"
              style={{ backgroundColor: COLORS.navy.primary }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
              disabled={isLoading}
            >
              {isLoading ? "전환 중..." : "전환"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, companies, setDefaultCompanyId, getDefaultCompanyId } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [selectedCompanyForSwitch, setSelectedCompanyForSwitch] = useState<Company | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleNumber: "",
    vehicleType: "화물차",
    tonnage: "",
    yearModel: undefined,
    region: "서울",
    insuranceRate: 100,
    monthlyFee: 250000,
    description: "",
  });

  const regions = [
    "서울",
    "부산",
    "대구",
    "인천",
    "광주",
    "대전",
    "울산",
    "세종",
    "경기",
    "강원",
    "충북",
    "충남",
    "전북",
    "전남",
    "경북",
    "경남",
    "제주",
  ];
  const vehicleTypes = ["화물차"];

  useEffect(() => {
    loadMyVehicles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };

    if (isCompanyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCompanyDropdownOpen]);

  const handleCompanySwitch = (company: Company) => {
    // 현재 회사와 같으면 전환하지 않음
    if (user && (user as Company).id === company.id) {
      setIsCompanyDropdownOpen(false);
      return;
    }
    setSelectedCompanyForSwitch(company);
    setIsCompanyDropdownOpen(false);
  };


  const handleSwitchSuccess = () => {
    // 새 회사로 전환되었으므로 차량 목록만 다시 로드
    loadMyVehicles();
  };

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
      vehicleType: "화물차",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="회사 대시보드" />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 회사 선택 및 추가 */}
        {user && (user as Company)?.companyName && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                등록할 회사
              </label>
              <button
                type="button"
                onClick={() => navigate("/profile?addCompany=true")}
                className="text-sm px-3 py-1 text-white rounded-md transition"
                style={{ backgroundColor: COLORS.navy.primary }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
              >
                + 회사 추가
              </button>
            </div>
            {companies && companies.length > 1 ? (
              <div className="flex gap-2">
                <div className="relative flex-1" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white flex items-center justify-between hover:border-gray-400 transition cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{(user as Company)?.companyName}</span>
                      <span className="text-xs text-gray-500">{(user as Company)?.businessNumber}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        isCompanyDropdownOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isCompanyDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="py-1">
                        {[...companies]
                          .sort((a, b) => {
                            const defaultId = getDefaultCompanyId();
                            // 기본 회사를 맨 앞으로
                            if (a.id === defaultId) return -1;
                            if (b.id === defaultId) return 1;
                            return 0;
                          })
                          .map((company) => {
                            const isCurrentCompany = (user as Company)?.id === company.id;
                            const isDefaultCompany = getDefaultCompanyId() === company.id;
                            return (
                              <button
                                key={company.id}
                                type="button"
                                onClick={() => handleCompanySwitch(company)}
                                className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition ${
                                  isCurrentCompany
                                    ? "bg-blue-100 text-blue-900 font-medium"
                                    : "text-gray-900"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <div className="font-medium">{company.companyName}</div>
                                    <div className="text-xs text-gray-500">{company.businessNumber}</div>
                                  </div>
                                  {isDefaultCompany && (
                                    <span className="text-sm text-blue-600 font-medium">기본</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
                {/* 기본 회사 설정 체크 버튼 */}
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      const currentCompanyId = (user as Company).id;
                      setDefaultCompanyId(currentCompanyId);
                      window.alert(`${(user as Company).companyName}이(가) 기본 회사로 설정되었습니다.`);
                    }
                  }}
                  className={`px-3 py-2 border rounded-md transition flex items-center justify-center ${
                    getDefaultCompanyId() === (user as Company)?.id
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-300 bg-white text-gray-400 hover:border-gray-400"
                  }`}
                  title="기본 회사로 설정"
                >
                  {getDefaultCompanyId() === (user as Company)?.id ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{(user as Company)?.companyName}</span>
                  <span className="text-xs text-gray-500">{(user as Company)?.businessNumber}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Vehicle Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 text-white rounded-lg font-semibold transition"
            style={{ backgroundColor: COLORS.navy.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
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
                <CustomSelect
                  value={formData.region}
                  onChange={(value) =>
                    setFormData({ ...formData, region: value })
                  }
                  options={regions.map((region) => ({ value: region, label: region }))}
                  placeholder="지역을 선택하세요"
                  required
                  className="w-full"
                />
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
                  className="px-6 py-2 text-white rounded-md transition"
                  style={{ backgroundColor: COLORS.navy.primary }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
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
              <div 
                className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: COLORS.navy.primary }}
              ></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">등록된 차량이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">
                위의 버튼을 클릭하여 차량을 등록하세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          ? "bg-blue-100 text-blue-800"
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
                      className="flex-1 py-2 text-white rounded-md text-sm transition"
                      style={{ backgroundColor: COLORS.navy.primary }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.hover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.navy.primary)}
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
      {/* 회사 전환 모달 */}
      {selectedCompanyForSwitch && (
        <CompanySwitchModal
          isOpen={!!selectedCompanyForSwitch}
          onClose={() => setSelectedCompanyForSwitch(null)}
          company={selectedCompanyForSwitch}
          onSuccess={handleSwitchSuccess}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;
