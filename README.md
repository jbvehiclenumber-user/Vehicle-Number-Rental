# Vehicle-Number-Rental

영업용 차량 번호 임대 중개 플랫폼

## 프로젝트 개요

국토부가 허용되는 범주 내에서 영업용 번호 임대를 위한 거래가 이뤄지는 플랫폼입니다.

### 주요 기능

- **회원가입/로그인**: 회사(사업자등록번호 인증) 및 개인(본인인증) 회원
- **번호 등록**: 회사가 보유한 차량 번호 등록 및 관리
- **번호 검색**: 지역별, 차종별, 가격별 검색 및 필터링
- **결제 시스템**: 1만원 고정 결제 후 연락처 공개
- **연락처 공개**: 결제 완료 후 회사 연락처 확인 가능

### 기술 스택

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **Payment**: 토스페이먼츠 (예정)
- **SMS**: 네이버 클라우드 플랫폼 (예정)

## 설치 및 실행

### 1. 의존성 설치

```bash
cd server
npm install
```

### 2. 환경 변수 설정

```bash
cp env.example .env
# .env 파일을 편집하여 실제 값으로 변경
```

### 3. 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# 데이터베이스 시드 (선택사항)
npx prisma db seed
```

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

## API 엔드포인트

### 인증 (Auth)

- `POST /api/auth/register/user` - 개인 회원가입
- `POST /api/auth/register/company` - 회사 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/verify-business` - 사업자등록번호 인증
- `POST /api/auth/send-verification` - 인증번호 발송
- `POST /api/auth/verify-user` - 개인 본인인증
- `GET /api/auth/me` - 현재 사용자 정보

### 차량 (Vehicles)

- `GET /api/vehicles` - 차량 목록 조회 (검색/필터링)
- `GET /api/vehicles/:id` - 차량 상세 조회
- `GET /api/vehicles/my` - 내 차량 목록 (회사만)
- `POST /api/vehicles` - 차량 등록 (회사만)
- `PUT /api/vehicles/:id` - 차량 수정 (회사만)
- `DELETE /api/vehicles/:id` - 차량 삭제 (회사만)
- `GET /api/vehicles/stats/region` - 지역별 통계
- `GET /api/vehicles/stats/type` - 차종별 통계

### 결제 (Payments)

- `POST /api/payments` - 결제 요청 (1만원 고정)
- `GET /api/payments/my` - 내 결제 내역
- `GET /api/payments/status/:vehicleId` - 결제 상태 확인
- `GET /api/payments/contact/:vehicleId` - 결제 후 연락처 조회

### 회사 (Companies)

- `GET /api/companies/profile` - 회사 정보 조회
- `PUT /api/companies/profile` - 회사 정보 수정
- `GET /api/companies/stats` - 회사 통계 조회

## 데이터베이스 스키마

### 주요 테이블

- **companies**: 회사 정보 (사업자등록번호, 회사명 등)
- **users**: 개인 사용자 정보 (이름, 전화번호 등)
- **vehicles**: 차량 번호 정보 (차량번호, 차종, 지역, 지입료 등)
- **payments**: 결제 이력 (1만원 고정 결제)

## 개발 단계

### 1단계 (완료)

- ✅ 기본 UI/UX 설계
- ✅ 회원가입/로그인 기능
- ✅ 사업자등록번호 인증 API 연동 (시뮬레이션)

### 2단계 (완료)

- ✅ 번호 등록/수정/삭제 기능
- ✅ 지역별 검색/필터링
- ✅ 기본적인 목록 표시

### 3단계 (완료)

- ✅ 결제 시스템 연동 (시뮬레이션)
- ✅ 연락처 공개 기능
- ✅ 채팅 또는 문의 기능

### 4단계 (예정)

- 🔄 관리자 페이지
- 🔄 통계/리포트 기능
- 🔄 최종 테스트 및 배포

## 보안 고려사항

- 사업자등록번호 인증은 실제 국세청 API 연동 필요
- 개인 본인인증은 실제 SMS API 연동 필요
- 결제 시스템은 실제 토스페이먼츠 등 연동 필요
- JWT 토큰 보안 강화 필요
- 데이터베이스 접근 권한 관리 필요

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
