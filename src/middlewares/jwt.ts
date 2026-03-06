import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
type RequestWithUser = Request & { user?: any };

export function generateToken(payload: { username: string, role: "ADMIN" | "DEVELOPER" }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function jwtMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
  const tokenHeader = req.cookies['auth_token']
  
  if (!tokenHeader) {
    res.status(401).json({ error: "Missing Authorization header" });
    return
  }

  const token = tokenHeader
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (!decoded.role) {
      throw new Error()
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return
  }
}