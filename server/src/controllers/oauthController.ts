// src/controllers/oauthController.ts
import { Request, Response } from "express";
import axios from "axios";
import { getKakaoUserInfo, getGoogleUserInfo, handleOAuthLogin } from "../services/oauthService";
import { logger } from "../utils/logger";

/**
 * 카카오 OAuth 인증 URL 생성
 */
export const getKakaoAuthUrl = (req: Request, res: Response) => {
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

  if (!KAKAO_CLIENT_ID) {
    return res.status(500).json({ message: "카카오 클라이언트 ID가 설정되지 않았습니다." });
  }

  if (!KAKAO_REDIRECT_URI) {
    return res.status(500).json({ message: "카카오 Redirect URI가 설정되지 않았습니다." });
  }

  // Redirect URI 정규화 (공백 제거)
  const redirectUri = KAKAO_REDIRECT_URI.trim();
  
  // 카카오 인증 URL 생성
  // redirect_uri는 카카오 콘솔에 등록된 것과 정확히 일치해야 함
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  logger.info("Kakao auth URL generated", {
    redirect_uri: redirectUri,
    redirect_uri_encoded: encodeURIComponent(redirectUri),
    redirect_uri_length: redirectUri.length,
    client_id: KAKAO_CLIENT_ID ? "set" : "not set",
    full_auth_url: kakaoAuthUrl,
  });

  res.json({ authUrl: kakaoAuthUrl });
};

/**
 * 카카오 OAuth 콜백 처리
 */
export const kakaoCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("인증 코드가 없습니다.")}`);
    }

    const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
    const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
    const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
    const FRONTEND_URL = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";

    if (!KAKAO_REDIRECT_URI) {
      return res.redirect(`${FRONTEND_URL}/login?error=카카오 Redirect URI가 설정되지 않았습니다.`);
    }

    // 카카오 토큰 요청
    // Redirect URI는 카카오가 실제로 리다이렉트한 URL과 정확히 일치해야 함
    // 카카오는 쿼리 파라미터를 제외한 base URL만 비교하므로, 정확히 일치해야 함
    const redirectUri = KAKAO_REDIRECT_URI.trim(); // 공백 제거
    
    logger.info("Kakao token request", {
      redirect_uri: redirectUri,
      redirect_uri_length: redirectUri.length,
      code_length: code?.length,
      client_id: KAKAO_CLIENT_ID ? "set" : "not set",
      request_url: req.url,
      request_headers: req.headers.host,
    });

    let tokenResponse;
    try {
      tokenResponse = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          client_id: KAKAO_CLIENT_ID!,
          client_secret: KAKAO_CLIENT_SECRET!,
          redirect_uri: redirectUri, // 카카오가 실제로 리다이렉트한 URL과 정확히 일치해야 함
          code: code as string,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    } catch (tokenError: any) {
      const errorData = tokenError.response?.data;
      logger.error("Kakao token request failed", tokenError instanceof Error ? tokenError : new Error(String(tokenError)), {
        response: errorData,
        status: tokenError.response?.status,
        redirect_uri_used: redirectUri,
        redirect_uri_encoded: encodeURIComponent(redirectUri),
        code: code,
      });
      const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
      const errorMsg = errorData?.error_description || errorData?.error || "카카오 토큰 요청에 실패했습니다.";
      
      // Redirect URI 불일치 에러인 경우 더 자세한 메시지
      if (errorData?.error === "invalid_grant" || errorMsg.includes("authorization code") || errorMsg.includes("not found")) {
        // 실제 카카오 에러 메시지 확인
        const kakaoErrorMsg = errorData?.error_description || errorMsg;
        logger.error("Kakao invalid_grant error details", new Error(kakaoErrorMsg), {
          kakao_error: errorData?.error,
          kakao_error_description: errorData?.error_description,
          redirect_uri_used: redirectUri,
          redirect_uri_from_env: KAKAO_REDIRECT_URI,
          code_preview: code && typeof code === 'string' ? `${code.substring(0, 20)}...` : "no code",
        });
        
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(`카카오 인증 실패: ${kakaoErrorMsg}. 사용된 Redirect URI: ${redirectUri}. 카카오 콘솔의 Redirect URI와 정확히 일치하는지 확인하세요.`)}`);
      }
      
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMsg)}`);
    }

    const accessToken = tokenResponse.data.access_token;
    
    if (!accessToken) {
      logger.error("Kakao access token not found in response", new Error("No access token"), { response: tokenResponse.data });
      const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("카카오 액세스 토큰을 받을 수 없습니다.")}`);
    }

    // 사용자 정보 가져오기
    const userInfo = await getKakaoUserInfo(accessToken);

    // 로그인/회원가입 처리
    const result = await handleOAuthLogin(userInfo);

    // 클라이언트로 리다이렉트 (토큰, 사용자 정보 포함)
    const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
    const userData = encodeURIComponent(JSON.stringify(result.user));
    res.redirect(`${frontendUrl}/oauth/callback?token=${result.token}&userType=${result.userType}&user=${userData}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Kakao callback error", error instanceof Error ? error : new Error(String(error)), {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
    const encodedError = encodeURIComponent(errorMessage);
    res.redirect(`${frontendUrl}/login?error=${encodedError}`);
  }
};

/**
 * 구글 OAuth 인증 URL 생성
 */
export const getGoogleAuthUrl = (req: Request, res: Response) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "구글 클라이언트 ID가 설정되지 않았습니다." });
  }

  if (!GOOGLE_REDIRECT_URI) {
    return res.status(500).json({ message: "구글 Redirect URI가 설정되지 않았습니다." });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=email profile`;

  res.json({ authUrl: googleAuthUrl });
};

/**
 * 구글 OAuth 콜백 처리
 */
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("인증 코드가 없습니다.")}`);
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
    const FRONTEND_URL = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";

    if (!GOOGLE_REDIRECT_URI) {
      return res.redirect(`${FRONTEND_URL}/login?error=구글 Redirect URI가 설정되지 않았습니다.`);
    }

    // 구글 토큰 요청
    let tokenResponse;
    try {
      tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          code: code as string,
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    } catch (tokenError: any) {
      logger.error("Google token request failed", tokenError instanceof Error ? tokenError : new Error(String(tokenError)), {
        response: tokenError.response?.data,
        status: tokenError.response?.status,
      });
      const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
      const errorMsg = tokenError.response?.data?.error_description || tokenError.response?.data?.error || "구글 토큰 요청에 실패했습니다.";
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMsg)}`);
    }

    const accessToken = tokenResponse.data.access_token;
    
    if (!accessToken) {
      logger.error("Google access token not found in response", new Error("No access token"), { response: tokenResponse.data });
      const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("구글 액세스 토큰을 받을 수 없습니다.")}`);
    }

    // 사용자 정보 가져오기
    const userInfo = await getGoogleUserInfo(accessToken);

    // 로그인/회원가입 처리
    const result = await handleOAuthLogin(userInfo);

    // 클라이언트로 리다이렉트 (토큰, 사용자 정보 포함)
    const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
    const userData = encodeURIComponent(JSON.stringify(result.user));
    res.redirect(`${frontendUrl}/oauth/callback?token=${result.token}&userType=${result.userType}&user=${userData}`);
  } catch (error) {
    logger.error("Google callback error", error instanceof Error ? error : new Error(String(error)));
    const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
    res.redirect(`${frontendUrl}/login?error=구글 로그인에 실패했습니다.`);
  }
};

