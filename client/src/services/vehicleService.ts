import api from "./api";
import { Vehicle, VehicleFormData, VehicleFilter } from "../types/vehicle";

export const vehicleService = {
  // 차량 목록 조회
  getVehicles: async (filter?: VehicleFilter): Promise<Vehicle[]> => {
    const response = await api.get("/vehicles", { params: filter });
    return response.data;
  },

  // 차량 상세 조회
  getVehicle: async (id: string): Promise<Vehicle> => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // 차량 등록 (회사만)
  createVehicle: async (data: VehicleFormData): Promise<Vehicle> => {
    const response = await api.post("/vehicles", data);
    return response.data;
  },

  // 차량 수정 (회사만)
  updateVehicle: async (
    id: string,
    data: Partial<VehicleFormData>
  ): Promise<Vehicle> => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  // 차량 삭제 (회사만)
  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  // 내 차량 목록 (회사만)
  getMyVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get("/vehicles/my");
    return response.data;
  },
};
