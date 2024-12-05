import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { sessions, users } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
      session?: typeof sessions.$inferSelect;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Find valid session
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date())
        )
      );

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
