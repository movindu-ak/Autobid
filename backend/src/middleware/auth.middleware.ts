import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please provide a valid token.',
      });
      return;
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Check if user still exists
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
        return;
      }

      // Attach user to request
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
    return;
  }
};

// Optional auth - doesn't fail if no token provided
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (user) {
          req.user = {
            id: decoded.userId,
            email: decoded.email,
          };
        }
      } catch (error) {
        // Token invalid, but we continue without user
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }

    next();
  } catch (error) {
    next();
  }
};
