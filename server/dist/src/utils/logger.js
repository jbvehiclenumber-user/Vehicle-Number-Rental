"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    formatLog(entry) {
        const { level, message, timestamp, error, metadata } = entry;
        const logData = {
            level,
            message,
            timestamp,
        };
        if (error) {
            logData.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }
        if (metadata) {
            logData.metadata = metadata;
        }
        return JSON.stringify(logData);
    }
    log(level, message, error, metadata) {
        const entry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            error,
            metadata,
        };
        const formattedLog = this.formatLog(entry);
        switch (level) {
            case LogLevel.ERROR:
                console.error(formattedLog);
                break;
            case LogLevel.WARN:
                console.warn(formattedLog);
                break;
            case LogLevel.INFO:
                console.info(formattedLog);
                break;
            case LogLevel.DEBUG:
                if (process.env.NODE_ENV === "development") {
                    console.debug(formattedLog);
                }
                break;
        }
    }
    error(message, error, metadata) {
        this.log(LogLevel.ERROR, message, error, metadata);
    }
    warn(message, metadata) {
        this.log(LogLevel.WARN, message, undefined, metadata);
    }
    info(message, metadata) {
        this.log(LogLevel.INFO, message, undefined, metadata);
    }
    debug(message, metadata) {
        this.log(LogLevel.DEBUG, message, undefined, metadata);
    }
    /**
     * HTTP 요청 로깅
     */
    logRequest(req, metadata) {
        this.info(`${req.method} ${req.path}`, {
            ...metadata,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        });
    }
}
exports.logger = new Logger();
exports.default = exports.logger;
