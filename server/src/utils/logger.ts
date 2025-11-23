// src/utils/logger.ts
import { Request } from "express";

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  error?: Error;
  metadata?: Record<string, any>;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, error, metadata } = entry;
    const logData: any = {
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

  private log(level: LogLevel, message: string, error?: Error, metadata?: Record<string, any>) {
    const entry: LogEntry = {
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

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, error, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, undefined, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, undefined, metadata);
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, undefined, metadata);
  }

  /**
   * HTTP 요청 로깅
   */
  logRequest(req: Request, metadata?: Record<string, any>) {
    this.info(`${req.method} ${req.path}`, {
      ...metadata,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  }
}

export const logger = new Logger();
export default logger;
