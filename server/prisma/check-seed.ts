/// <reference types="node" />
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSeed() {
  console.log("🔍 시드 데이터 확인 중...\n");

  // 사용자 확인
  const users = await prisma.user.findMany();
  console.log(`📱 기사 (User) 데이터: ${users.length}개`);
  users.forEach((user) => {
    console.log(`  - ${user.name} (${user.phone}) - 인증: ${user.verified ? "완료" : "미완료"}`);
  });

  console.log();

  // 회사 확인
  const companies = await prisma.company.findMany();
  console.log(`🏢 회사 (Company) 데이터: ${companies.length}개`);
  companies.forEach((company) => {
    console.log(`  - ${company.companyName} (${company.phone}, ${company.businessNumber}) - 인증: ${company.verified ? "완료" : "미완료"}`);
  });

  console.log();

  // 특정 전화번호로 검색 테스트
  console.log("🔎 검색 테스트:");
  const testPhone1 = "010-1111-2222";
  const testPhone2 = "02-1234-5678";
  
  const user1 = await prisma.user.findUnique({ where: { phone: testPhone1 } });
  console.log(`  기사 "${testPhone1}": ${user1 ? "✅ 찾음" : "❌ 없음"}`);
  
  const company1 = await prisma.company.findFirst({ where: { phone: testPhone2 } });
  console.log(`  회사 "${testPhone2}": ${company1 ? "✅ 찾음" : "❌ 없음"}`);

  await prisma.$disconnect();
}

checkSeed().catch(console.error);

