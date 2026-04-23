# Vehicle-Number-Rental

영업용 차량 번호(넘버) 중개 플랫폼.

## 프로젝트 개요

국토부가 허용되는 범주 내에서 영업용 번호 임대를 위한 거래가 
이뤄지는 플랫폼입니다.

## 구성

- **`client/`**: React (CRA) 프론트엔드
- **`server/`**: Express + TypeScript 백엔드 (Prisma + PostgreSQL)

## 로컬 실행

### 프론트엔드

```bash
cd client
npm install
npm start
```

- 기본 접속: `http://localhost:3000`
- API 주소는 `client/.env`의 `REACT_APP_API_URL`로 설정합니다.

### 백엔드

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

- 기본 포트: `server/.env`의 `PORT` (예: 5000)
- 헬스체크: `GET /health`

## 현재 동작(중요)

- **차량 목록/상세는 비로그인도 접근 가능**
  - 목록: `GET /api/vehicles`
  - 상세: `GET /api/vehicles/:id`
- **연락처는 로그인한 경우에만 노출**
  - 상세 조회 시 토큰이 없으면 회사의 `phone/contactPhone`은 내려가지 않습니다.
  - 프론트 상세 화면에서는 연락처 영역이 “자세히 보기 → 로그인 필요 모달 → 로그인 이동” 흐름으로 동작합니다.

## 이메일(Resend) 설정

- 서버 환경변수에 `RESEND_API_KEY`, `EMAIL_FROM` 설정 필요
- 배포(Render 등)에서는 **로컬 `.env`가 적용되지 않으니** 배포 환경변수에 동일하게 설정해야 합니다.

## 주요 API

- **Auth**
  - `POST /api/auth/register/user`
  - `POST /api/auth/register/company`
  - `POST /api/auth/login`
  - `POST /api/auth/password/reset-request`
  - `POST /api/auth/password/reset`
- **Vehicles**
  - `GET /api/vehicles`
  - `GET /api/vehicles/:id`
  - `GET /api/vehicles/my` (회사)
