import chalk from "chalk";

const LogLevel = {
  Error: "ERROR",
  Warn: "WARN",
  Info: "INFO",
  Debug: "DEBUG",
  Verbose: "VERBOSE",
} as const;

type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export class Logger {
  private context?: string;
  private timestamp: boolean;

  constructor(context: string = "", options: { timestamp?: boolean } = {}) {
    this.context = context;
    this.timestamp = options.timestamp ?? false;
  }

  private formatMessage(level: LogLevel, message: unknown, context?: string): string {
    let result = `[${level}]`;
    if (this.timestamp) {
      result += ` ${new Date().toISOString()}`;
    }
    result += ` [${context ?? this.context}] ${message}`;
    return result;
  }

  private colorize(level: LogLevel, message: string): string {
    switch (level) {
      case LogLevel.Error:
        return chalk.red(message);
      case LogLevel.Warn:
        return chalk.yellow(message);
      case LogLevel.Info:
        return chalk.blue(message);
      case LogLevel.Debug:
        return chalk.magenta(message);
      case LogLevel.Verbose:
        return chalk.cyan(message);
      default:
        return message;
    }
  }

  public error(message: unknown, context?: string): void {
    console.error(
      this.colorize(LogLevel.Error, this.formatMessage(LogLevel.Error, message, context))
    );
  }

  public warn(message: unknown, context?: string): void {
    console.warn(this.colorize(LogLevel.Warn, this.formatMessage(LogLevel.Warn, message, context)));
  }

  public log(message: unknown, context?: string): void {
    console.log(this.colorize(LogLevel.Info, this.formatMessage(LogLevel.Info, message, context)));
  }

  public debug(message: unknown, context?: string): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        this.colorize(LogLevel.Debug, this.formatMessage(LogLevel.Debug, message, context))
      );
    }
  }

  public verbose(message: unknown, context?: string): void {
    console.log(
      this.colorize(LogLevel.Verbose, this.formatMessage(LogLevel.Verbose, message, context))
    );
  }
}
