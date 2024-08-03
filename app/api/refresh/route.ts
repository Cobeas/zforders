import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

export async function POST(request: Request) {
  const { refreshToken } = await request.json();

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token provided' }, { status: 403 });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY || '') as jwt.JwtPayload;
    const newAccessToken = jwt.sign({ user: decoded.user }, SECRET_KEY as string, { expiresIn: '8h' });
    return NextResponse.json({ accessToken: newAccessToken });
  } catch (err) {
    return NextResponse.json({ message: 'Invalid refresh token' }, { status: 403 });
  }
}