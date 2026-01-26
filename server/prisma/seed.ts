/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 데이터 생성 시작...");

  // 비밀번호 해시 (모두 "password123"으로 통일)
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 기존 데이터 삭제 (선택사항 - 주석 해제하면 매번 초기화)
  // await prisma.payment.deleteMany();
  // await prisma.vehicle.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.company.deleteMany();

  // 회사 데이터 생성
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { businessNumber: "123-45-67890" },
      update: {},
      create: {
        businessNumber: "123-45-67890",
        companyName: "서울 택시 운수",
        representative: "홍길동",
        phone: "02-1234-5678",
        email: "seoul-taxi@example.com",
        password: hashedPassword,
        verified: true,
        verifiedAt: new Date(),
      },
    }),
    prisma.company.upsert({
      where: { businessNumber: "234-56-78901" },
      update: {},
      create: {
        businessNumber: "234-56-78901",
        companyName: "경기 화물 운송",
        representative: "이영희",
        phone: "031-2345-6789",
        email: "gyeonggi-cargo@example.com",
        password: hashedPassword,
        verified: true,
        verifiedAt: new Date(),
      },
    }),
    prisma.company.upsert({
      where: { businessNumber: "345-67-89012" },
      update: {},
      create: {
        businessNumber: "345-67-89012",
        companyName: "인천 버스 교통",
        representative: "최동욱",
        phone: "032-3456-7890",
        email: "incheon-bus@example.com",
        password: hashedPassword,
        verified: false, // 인증되지 않은 회사 예시
      },
    }),
  ]);

  console.log(`✅ ${companies.length}개의 회사 데이터 생성 완료`);

  // 기사(User) 데이터 생성
  const users = await Promise.all([
    prisma.user.upsert({
      where: { phone: "010-1111-2222" },
      update: {},
      create: {
        name: "김기사",
        phone: "010-1111-2222",
        password: hashedPassword,
        verified: true,
        verifiedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { phone: "010-2222-3333" },
      update: {},
      create: {
        name: "이기사",
        phone: "010-2222-3333",
        password: hashedPassword,
        verified: true,
        verifiedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { phone: "010-3333-4444" },
      update: {},
      create: {
        name: "박기사",
        phone: "010-3333-4444",
        password: hashedPassword,
        verified: false, // 인증되지 않은 기사 예시
      },
    }),
    prisma.user.upsert({
      where: { phone: "010-4444-5555" },
      update: {},
      create: {
        name: "최기사",
        phone: "010-4444-5555",
        password: hashedPassword,
        verified: true,
        verifiedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ ${users.length}개의 기사 데이터 생성 완료`);

  // 차량 데이터 생성 (선택사항 - 테스트용)
  const vehicleData = [
    {
      companyId: companies[0].id,
      vehicleNumber: "서울 12가 3456",
      vehicleType: "택시",
      region: "서울",
      insuranceRate: 5,
      monthlyFee: 1500000,
      description: "깨끗한 차량입니다.",
      isAvailable: true,
      yearModel: 2023,
    },
    {
      companyId: companies[0].id,
      vehicleNumber: "서울 34나 5678",
      vehicleType: "택시",
      region: "서울",
      insuranceRate: 6,
      monthlyFee: 1600000,
      description: "신형 차량",
      isAvailable: true,
      yearModel: 2024,
    },
    {
      companyId: companies[1].id,
      vehicleNumber: "경기 56다 7890",
      vehicleType: "화물차",
      tonnage: "2.5톤",
      region: "경기",
      insuranceRate: 7,
      monthlyFee: 2000000,
      description: "2.5톤 화물차",
      isAvailable: true,
      yearModel: 2022,
    },
  ];

  const vehicles = await Promise.all(
    vehicleData.map(async (data) => {
      const existing = await prisma.vehicle.findFirst({
        where: {
          companyId: data.companyId,
          vehicleNumber: data.vehicleNumber,
        },
      });
      if (existing) {
        return existing;
      }
      return prisma.vehicle.create({ data });
    })
  );

  console.log(`✅ ${vehicles.length}개의 차량 데이터 생성 완료`);

  console.log("\n📋 생성된 데이터 요약:");
  console.log(`- 회사: ${companies.length}개`);
  console.log(`- 기사: ${users.length}개`);
  console.log(`- 차량: ${vehicles.length}개`);
  console.log("\n🔑 테스트 계정 정보:");
  console.log("회사 로그인:");
  console.log("  - 전화번호: 02-1234-5678, 비밀번호: password123");
  console.log("  - 전화번호: 031-2345-6789, 비밀번호: password123");
  console.log("기사 로그인:");
  console.log("  - 전화번호: 010-1111-2222, 비밀번호: password123");
  console.log("  - 전화번호: 010-2222-3333, 비밀번호: password123");
  console.log("\n✨ 시드 데이터 생성 완료!");
}

main()
  .catch((e) => {
    console.error("❌ 시드 데이터 생성 중 오류 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

