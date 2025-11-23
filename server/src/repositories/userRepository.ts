// src/repositories/userRepository.ts
import { prisma } from "../utils/prisma";
import { User } from "@prisma/client";

export class UserRepository {
  /**
   * 전화번호 정규화 (하이픈 제거)
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/-/g, "");
  }

  /**
   * 전화번호로 사용자 조회 (하이픈 포함/미포함 모두 지원)
   */
  async findByPhone(phone: string): Promise<User | null> {
    // 정확한 매칭 시도
    const exactMatch = await prisma.user.findUnique({
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
        return prisma.user.findUnique({
          where: { phone: formattedPhone },
        });
      }
    }

    return null;
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 사용자 생성
   */
  async create(data: {
    name: string;
    phone: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * 사용자 업데이트
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * 사용자 인증 상태 업데이트
   */
  async updateVerification(id: string, verified: boolean): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        verified,
        verifiedAt: verified ? new Date() : null,
      },
    });
  }

  /**
   * 마지막 로그인 시간 업데이트
   */
  async updateLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }
}

export const userRepository = new UserRepository();


