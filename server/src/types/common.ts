// src/types/common.ts

export type UserType = "user" | "company";

export interface AuthUser {
  userId: string;
  userType: UserType;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VehicleFilter {
  region?: string;
  vehicleType?: string;
  minFee?: number;
  maxFee?: number;
  tonnage?: string;
  yearModel?: number;
  search?: string;
}


