import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { db } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "momentum-dev-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  tier: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// 生成 JWT
export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 验证 JWT
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// 密码验证
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 用户认证中间件
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // 从 Authorization header 或 cookie 获取 token
  let token: string | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "未授权，请先登录" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "登录已过期，请重新登录" });
  }

  // 查询用户
  const user = db
    .prepare("SELECT id, email, name, tier FROM users WHERE id = ?")
    .get(payload.userId) as AuthUser | undefined;

  if (!user) {
    return res.status(401).json({ error: "用户不存在" });
  }

  req.user = user;
  next();
}

// 可选认证中间件（不强制要求登录）
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  let token: string | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = db
        .prepare("SELECT id, email, name, tier FROM users WHERE id = ?")
        .get(payload.userId) as AuthUser | undefined;
      if (user) {
        req.user = user;
      }
    }
  }

  next();
}

// 生成用户ID
export function generateUserId(): string {
  return `user-${uuidv4()}`;
}

// 输入验证
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "密码至少需要8个字符" };
  }
  if (password.length > 128) {
    return { valid: false, message: "密码不能超过128个字符" };
  }
  return { valid: true };
}
