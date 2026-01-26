import { Resend } from "resend";
import { logger } from "../utils/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordResetEmailParams {
  email: string;
  resetToken: string;
  userName?: string;
}

/**
 * 비밀번호 재설정 이메일 전송
 */
export async function sendPasswordResetEmail({
  email,
  resetToken,
  userName,
}: SendPasswordResetEmailParams): Promise<void> {
  try {
    const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const fromEmail = process.env.EMAIL_FROM || "noreply@example.com";
    const appName = process.env.APP_NAME || "넘버링크";

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>비밀번호 재설정</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
    <h1 style="color: #001f3f; margin-top: 0;">비밀번호 재설정 요청</h1>
    
    <p>안녕하세요${userName ? ` ${userName}님` : ""},</p>
    
    <p>${appName}에서 비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정하세요.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="display: inline-block; background-color: #001f3f; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        비밀번호 재설정하기
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣으세요:
    </p>
    <p style="font-size: 12px; color: #999; word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
      ${resetUrl}
    </p>
    
    <p style="font-size: 12px; color: #999; margin-top: 30px;">
      ⚠️ 이 링크는 24시간 동안만 유효합니다.<br>
      이 요청을 하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; margin: 0;">
      이 이메일은 ${appName}에서 자동으로 발송되었습니다.
    </p>
  </div>
</body>
</html>
    `.trim();

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `[${appName}] 비밀번호 재설정`,
      html: emailContent,
    });

    if (error) {
      logger.error("Failed to send password reset email", new Error(error.message || "Unknown error"), {
        email,
        error_message: error.message,
      });
      throw new Error("이메일 전송에 실패했습니다.");
    }

    logger.info("Password reset email sent successfully", {
      email,
      email_id: data?.id,
    });
  } catch (error) {
    logger.error("Error sending password reset email", error instanceof Error ? error : new Error(String(error)), {
      email,
    });
    throw error;
  }
}

/**
 * 이메일 서비스가 사용 가능한지 확인
 */
export function isEmailServiceAvailable(): boolean {
  return !!process.env.RESEND_API_KEY;
}

