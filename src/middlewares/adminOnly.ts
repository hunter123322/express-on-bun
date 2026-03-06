import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { role: string };
    }
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden: Admins only" });
}
