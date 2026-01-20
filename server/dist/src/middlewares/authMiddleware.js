"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
/**
 * 인증 미들웨어 (필수)
 */
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        // req 객체에 사용자 정보 추가
        req.user = {
            userId: decoded.id,
            userType: decoded.type,
        };
        next();
    }
    catch (error) {
        logger_1.logger.warn("Invalid token", { error: error instanceof Error ? error.message : String(error) });
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
};
exports.authMiddleware = authMiddleware;
/**
 * 선택적 인증 미들웨어 (토큰이 있으면 사용자 정보를 설정, 없어도 통과)
 */
const optionalAuthMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            // req 객체에 사용자 정보 추가
            req.user = {
                userId: decoded.id,
                userType: decoded.type,
            };
        }
        next();
    }
    catch (error) {
        // 토큰이 유효하지 않아도 통과 (선택적 인증)
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
