import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

export async function POST(request: Request) {
  const { password } = await request.json();

  const storedPasswordHash = process.env.HASHED;

  const isMatch = await bcrypt.compare(password, storedPasswordHash as string);

  if (!isMatch) {
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
  }

  const accessToken = jwt.sign({ user: 'ZFmedewerker' }, SECRET_KEY as string, { expiresIn: '8h' });
  const refreshToken = jwt.sign({ user: 'ZFmedewerker' }, REFRESH_SECRET_KEY as string, { expiresIn: '7d' });

  return NextResponse.json({ accessToken, refreshToken });
}