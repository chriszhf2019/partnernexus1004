import winston from "winston";
import path from "path";
import fs from "fs";

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const isProduction = process.env.NODE_ENV === "production";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    return `${timestamp} [${level}] ${message} ${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: logFormat,
  defaultMeta: { service: "momentum" },
  transports: [
    // 错误日志
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    // 所有日志
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
      tailable: true,
    }),
  ],
});

if (!isProduction) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // 生产环境也输出到控制台（PM2 会收集）
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
    })
  );
}

export function logRequest(req: any, res: any, next: any) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP Request", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent")?.substring(0, 100),
    });
  });
  next();
}
