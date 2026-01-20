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
   * 전화번호로 사용자 조회 (하이픈 포함/미포함 모두 지원)
   */
  async findByPhone(phone: string): Promise<User | null> {
    // 정확한 매칭 시도
    const exactMatch = await prisma.user.findUnique({
      where: { phone },
    });
    if (exactMatch) return exactMatch;

    // 정규화된 전화번호로 비교
    const normalizedInput = this.normalizePhone(phone);
    
    // 하이픈 포함 형식으로 변환하여 시도
    const formattedPhone = this.formatPhone(normalizedInput);
    if (formattedPhone !== phone) {
      const formattedMatch = await prisma.user.findUnique({
        where: { phone: formattedPhone },
      });
      if (formattedMatch) return formattedMatch;
    }

    // 모든 사용자를 가져와서 정규화된 전화번호로 비교 (마지막 수단)
    const allUsers = await prisma.user.findMany();
    const matchedUser = allUsers.find(
      (user) => this.normalizePhone(user.phone) === normalizedInput
    );
    
    return matchedUser || null;
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
    email: string | null;
    password: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email || null, // 빈 문자열을 null로 변환
      },
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


