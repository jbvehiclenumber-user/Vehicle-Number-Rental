// src/repositories/companyRepository.ts
import { prisma } from "../utils/prisma";
import { Company } from "@prisma/client";

export class CompanyRepository {
  /**
   * 전화번호 정규화 (하이픈 제거)
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/-/g, "");
  }

  /**
   * 사업자등록번호로 회사 조회
   */
  async findByBusinessNumber(businessNumber: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { businessNumber },
    });
  }

  /**
   * 전화번호로 회사 조회 (하이픈 포함/미포함 모두 지원)
   */
  async findByPhone(phone: string): Promise<Company | null> {
    // 정확한 매칭 시도
    const exactMatch = await prisma.company.findFirst({
      where: { phone },
    });
    if (exactMatch) return exactMatch;

    // 하이픈 제거한 버전으로도 시도
    const normalizedPhone = this.normalizePhone(phone);
    if (normalizedPhone !== phone) {
      // 정규화된 전화번호로 검색 (하이픈 포함 형식으로 변환하여 시도)
      // 01012345678 -> 010-1234-5678 형식으로 변환
      let formattedPhone = normalizedPhone;
      if (normalizedPhone.length === 11 && normalizedPhone.startsWith("010")) {
        formattedPhone = `${normalizedPhone.slice(0, 3)}-${normalizedPhone.slice(3, 7)}-${normalizedPhone.slice(7)}`;
      } else if (normalizedPhone.length === 10 && normalizedPhone.startsWith("02")) {
        formattedPhone = `${normalizedPhone.slice(0, 2)}-${normalizedPhone.slice(2, 6)}-${normalizedPhone.slice(6)}`;
      } else if (normalizedPhone.length === 10) {
        formattedPhone = `${normalizedPhone.slice(0, 3)}-${normalizedPhone.slice(3, 6)}-${normalizedPhone.slice(6)}`;
      }
      
      if (formattedPhone !== phone) {
        return prisma.company.findFirst({
          where: { phone: formattedPhone },
        });
      }
    }

    return null;
  }

  /**
   * ID로 회사 조회
   */
  async findById(id: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { id },
    });
  }

  /**
   * 회사 생성
   */
  async create(data: {
    businessNumber: string;
    companyName: string;
    representative: string;
    address: string;
    contactPerson: string;
    phone: string;
    email?: string;
    password: string;
  }): Promise<Company> {
    return prisma.company.create({
      data,
    });
  }

  /**
   * 회사 업데이트
   */
  async update(id: string, data: Partial<Company>): Promise<Company> {
    return prisma.company.update({
      where: { id },
      data,
    });
  }

  /**
   * 회사 인증 상태 업데이트
   */
  async updateVerification(id: string, verified: boolean): Promise<Company> {
    return prisma.company.update({
      where: { id },
      data: {
        verified,
        verifiedAt: verified ? new Date() : null,
      },
    });
  }

  /**
   * 회사 통계 조회
   */
  async getStats(companyId: string) {
    const [totalVehicles, availableVehicles, totalViews, recentViews] = await Promise.all([
      prisma.vehicle.count({
        where: { companyId },
      }),
      prisma.vehicle.count({
        where: {
          companyId,
          isAvailable: true,
        },
      }),
      prisma.payment.count({
        where: {
          vehicle: { companyId },
          status: "completed",
        },
      }),
      prisma.payment.count({
        where: {
          vehicle: { companyId },
          status: "completed",
          paidAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
          },
        },
      }),
    ]);

    return {
      totalVehicles,
      availableVehicles,
      totalViews,
      recentViews,
    };
  }
}

export const companyRepository = new CompanyRepository();


