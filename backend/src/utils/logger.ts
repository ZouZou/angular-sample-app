export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    // In production, only log warnings and errors
    // In development, log everything
    this.logLevel = this.isDevelopment ? LogLevel.Debug : LogLevel.Warn;
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Get current log level
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Check if logging is enabled for a given level
   */
  isLevelEnabled(level: LogLevel): boolean {
    return level >= this.logLevel;
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
  error(message: string, error?: any, ...optionalParams: any[]): void {
    if (error) {
      this.writeToLog(LogLevel.Error, message, [error, ...optionalParams]);
    } else {
      this.writeToLog(LogLevel.Error, message, optionalParams);
    }
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
    const levelStr = LogLevel[level].toUpperCase();
    const logMessage = `[${timestamp}] [${levelStr}] ${message}`;

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

// Export a singleton instance
export const logger = new Logger();
