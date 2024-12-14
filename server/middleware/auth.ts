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
  try {
    console.log('Auth headers:', req.headers);
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    console.log('Auth attempt:', {
      hasAuthHeader: !!authHeader,
      token: token ? 'present' : 'missing'
    });

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

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

    console.log('Session lookup:', {
      found: !!session,
      expired: session ? new Date() > session.expiresAt : null
    });

    if (!session) {
      console.log('Invalid or expired session');
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));

    console.log('User lookup:', {
      found: !!user,
      userId: user?.id
    });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;
    console.log('Auth successful:', { userId: user.id });
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
