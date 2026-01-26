export interface Vehicle {
  id: string;
  companyId: string;
  vehicleNumber: string;
  vehicleType: string;
  tonnage?: string;
  yearModel?: number;
  region: string;
  insuranceRate: number;
  monthlyFee: number;
  description?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  company?: {
    companyName: string;
    phone: string;
    contactPhone?: string;
  };
}

export interface VehicleFormData {
  vehicleNumber: string;
  vehicleType: string;
  tonnage?: string;
  yearModel?: number;
  region: string;
  insuranceRate: number;
  monthlyFee: number;
  description?: string;
}

export interface VehicleFilter {
  region?: string;
  vehicleType?: string;
  minFee?: number;
  maxFee?: number;
}
