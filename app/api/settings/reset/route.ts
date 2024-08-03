import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware';
import { limiter } from '@/app/lib/middleware';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
    const authResponse = authMiddleware(request);
    
    if (authResponse.status !== 200) {
        return new NextResponse(null, { status: authResponse.status });
    }
    try {
        const result = await prisma.$executeRaw`
            SELECT reset_database();
        `;

        console.log("Reset result: ", result);

        return new NextResponse(JSON.stringify({ message: result }), { status: 200 });
    } catch (error) {
        console.error("Error resetting tables: ", error);
        return new NextResponse(JSON.stringify({ message: 'Er ging iets mis bij het resetten' }), { status: 400 });
    }
}