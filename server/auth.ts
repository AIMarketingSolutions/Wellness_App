import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check session first, then fall back to Authorization header
  let userId = req.session?.userId;
  
  // If no session, check for token in Authorization header
  if (!userId) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      userId = authHeader.substring(7);
    }
  }
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.userId = userId;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Compose with requireAuth - it will handle authentication and set req.userId
  return requireAuth(req, res, async () => {
    try {
      // requireAuth has already validated user exists and set req.userId
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Check if user email matches admin email from environment
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.error("ADMIN_EMAIL environment variable not set!");
        return res.status(500).json({ error: "Admin configuration error" });
      }

      if (user.email !== adminEmail) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
