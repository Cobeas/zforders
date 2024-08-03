import { NextRequest } from 'next/server';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export function authMiddleware(request: NextRequest) {
    const token = request.cookies.get('zftoken')?.value;

    if (!token) {
      return { status: 403, message: 'No token provided' };
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY || '');
      return { status: 200, user: decoded };
    } catch (err) {
      return { status: 500, message: 'Failed to authenticate token' };
    }
}

export const limiter = rateLimit({
    keyGenerator: (req, _res) => req.ip.replace(/:\d+[^:]*$/, ''),
    windowMs: 900000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});