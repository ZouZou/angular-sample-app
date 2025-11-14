import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4
}

/**
 * Logger service that provides environment-aware logging
 * In production, only errors are logged by default
 * In development, all log levels are enabled
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel;

  constructor() {
    // In production, only log errors and warnings
    // In development, log everything
    this.logLevel = environment.production ? LogLevel.Warn : LogLevel.Debug;
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, ...optionalParams: any[]): void {
    this.writeToLog(LogLevel.Debug, message, optionalParams);
  }

  /**
   * Log informational messages (development only)
   */
  info(message: string, ...optionalParams: any[]): void {
    this.writeToLog(LogLevel.Info, message, optionalParams);
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...optionalParams: any[]): void {
    this.writeToLog(LogLevel.Warn, message, optionalParams);
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, ...optionalParams: any[]): void {
    this.writeToLog(LogLevel.Error, message, optionalParams);
  }

  /**
   * Log messages with context information
   */
  logWithContext(level: LogLevel, context: string, message: string, ...optionalParams: any[]): void {
    const contextMessage = `[${context}] ${message}`;
    this.writeToLog(level, contextMessage, optionalParams);
  }

  private writeToLog(level: LogLevel, message: string, params: any[]): void {
    if (level < this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    switch (level) {
      case LogLevel.Debug:
      case LogLevel.Info:
        if (params.length > 0) {
          console.log(logMessage, ...params);
        } else {
          console.log(logMessage);
        }
        break;
      case LogLevel.Warn:
        if (params.length > 0) {
          console.warn(logMessage, ...params);
        } else {
          console.warn(logMessage);
        }
        break;
      case LogLevel.Error:
        if (params.length > 0) {
          console.error(logMessage, ...params);
        } else {
          console.error(logMessage);
        }
        break;
    }
  }
}
