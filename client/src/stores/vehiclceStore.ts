// src/stores/vehicleStore.ts
import { create } from "zustand";
import { Vehicle, VehicleFilter } from "../types/vehicle";

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  filter: VehicleFilter;
  isLoading: boolean;

  // Actions
  setVehicles: (vehicles: Vehicle[]) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setFilter: (filter: VehicleFilter) => void;
  setLoading: (loading: boolean) => void;
  clearFilter: () => void;
}

export const useVehicleStore = create<VehicleState>((set) => ({
  vehicles: [],
  selectedVehicle: null,
  filter: {},
  isLoading: false,

  setVehicles: (vehicles) => set({ vehicles }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearFilter: () => set({ filter: {} }),
}));
