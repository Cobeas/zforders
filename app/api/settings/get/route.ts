import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware';
import { limiter } from '@/app/lib/middleware';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
    const authResponse = authMiddleware(request);
    
    if (authResponse.status !== 200) {
        return new NextResponse(null, { status: authResponse.status });
    }

    try {
        const result = await prisma.$queryRaw`SELECT get_db_instellingen() AS instellingen`;

        console.log("Get result: ", result);

        return new NextResponse(JSON.stringify({ message: result }), { status: 200 });
    } catch (error) {
        console.error("Error retreiving data: ", error);
        return new NextResponse(JSON.stringify({ message: 'Er is een fout opgetreden' }), { status: 400 });
    }
}