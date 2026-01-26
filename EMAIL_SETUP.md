# 이메일 전송 서비스 설정 가이드

이 프로젝트는 **Resend**를 사용하여 이메일을 전송합니다.

## Resend란?

Resend는 개발자 친화적인 이메일 API 서비스로, 무료 티어를 제공합니다:
- **무료 티어**: 월 3,000개 이메일, 일 100개 이메일
- **설정 간단**: API 키만 있으면 바로 사용 가능
- **TypeScript 지원**: 완벽한 타입 지원

## 설정 방법

### 1. Resend 계정 생성

1. [Resend 웹사이트](https://resend.com)에 접속
2. "Sign Up" 클릭하여 계정 생성
3. 이메일 인증 완료

### 2. API 키 발급

1. Resend 대시보드에 로그인
2. 좌측 메뉴에서 "API Keys" 클릭
3. "Create API Key" 버튼 클릭
4. API 키 이름 입력 (예: "Vehicle-Number-Rental")
5. 권한 선택 (기본적으로 "Sending access" 선택)
6. 생성된 API 키를 복사 (한 번만 표시되므로 안전하게 보관)

### 3. 도메인 설정 (선택사항)

**프로덕션 환경에서는 도메인을 설정하는 것을 강력히 권장합니다.**

1. Resend 대시보드에서 "Domains" 클릭
2. "Add Domain" 클릭
3. 도메인 입력 (예: `example.com`)
4. DNS 레코드 추가:
   - Resend가 제공하는 DNS 레코드를 도메인 DNS 설정에 추가
   - SPF, DKIM, DMARC 레코드 추가
5. 도메인 인증 완료 대기 (보통 몇 분 소요)

**개발 환경에서는 Resend의 기본 도메인(`onboarding@resend.dev`)을 사용할 수 있습니다.**

### 4. 환경 변수 설정

서버의 `.env` 파일에 다음 변수를 추가하세요:

```env
# Resend API 키
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 발신 이메일 주소 (도메인 설정 시)
EMAIL_FROM=noreply@yourdomain.com

# 또는 Resend 기본 도메인 사용 시
EMAIL_FROM=onboarding@resend.dev

# 앱 이름 (이메일 제목에 사용)
APP_NAME=넘버링크

# 프론트엔드 URL (비밀번호 재설정 링크에 사용)
FRONTEND_URL=http://localhost:3000
```

### 5. 서버 재시작

환경 변수를 설정한 후 서버를 재시작하세요:

```bash
cd server
npm run dev
```

## 테스트

1. 비밀번호 찾기 페이지로 이동
2. 등록된 이메일 주소 입력
3. "재설정 링크 전송" 클릭
4. 이메일 수신함 확인 (스팸함도 확인)

## 문제 해결

### 이메일이 오지 않는 경우

1. **스팸함 확인**: 이메일이 스팸함으로 이동했을 수 있습니다.
2. **API 키 확인**: `.env` 파일의 `RESEND_API_KEY`가 올바른지 확인
3. **서버 로그 확인**: 이메일 전송 실패 시 서버 로그에 에러가 기록됩니다
4. **Resend 대시보드 확인**: Resend 대시보드의 "Logs" 섹션에서 전송 상태 확인

### 개발 환경에서 토큰 표시

`RESEND_API_KEY`가 설정되지 않았거나 이메일 전송에 실패한 경우, 개발 환경에서는 화면에 토큰이 표시됩니다. 이를 사용하여 비밀번호를 재설정할 수 있습니다.

## 대안: 다른 이메일 서비스

Resend 대신 다른 서비스를 사용하고 싶다면:

### SendGrid
- 무료 티어: 일 100개 이메일
- 패키지: `@sendgrid/mail`
- [문서](https://docs.sendgrid.com/for-developers/sending-email/nodejs)

### Mailgun
- 무료 티어: 월 5,000개 이메일 (첫 3개월)
- 패키지: `mailgun.js`
- [문서](https://documentation.mailgun.com/en/latest/quickstart-sending.html)

### Nodemailer + Gmail
- 무료 (Gmail 계정 필요)
- 일 500개 이메일 제한
- 앱 비밀번호 필요
- 패키지: `nodemailer`
- [문서](https://nodemailer.com/about/)

## 보안 주의사항

- **절대 API 키를 Git에 커밋하지 마세요**
- `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요 (예: Vercel, AWS Secrets Manager)

