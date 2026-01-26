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
   * 전화번호 포맷팅 (하이픈 추가)
   */
  private formatPhone(phone: string): string {
    const numbers = phone.replace(/[^\d]/g, "");
    if (numbers.length === 11 && numbers.startsWith("010")) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10 && numbers.startsWith("02")) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else if (numbers.length === 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    return phone;
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

    // 정규화된 전화번호로 비교
    const normalizedInput = this.normalizePhone(phone);
    
    // 하이픈 포함 형식으로 변환하여 시도
    const formattedPhone = this.formatPhone(normalizedInput);
    if (formattedPhone !== phone) {
      const formattedMatch = await prisma.company.findFirst({
        where: { phone: formattedPhone },
      });
      if (formattedMatch) return formattedMatch;
    }

    // 모든 회사를 가져와서 정규화된 전화번호로 비교 (마지막 수단)
    const allCompanies = await prisma.company.findMany();
    const matchedCompany = allCompanies.find(
      (company) => this.normalizePhone(company.phone) === normalizedInput
    );
    
    return matchedCompany || null;
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
    phone: string;
    contactPhone?: string;
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


