import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware';
import { limiter } from '@/app/lib/middleware';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const result = await prisma.$queryRaw`SELECT * from get_open_orders()`;

        console.log("Get orders: ", result);

        return new NextResponse(JSON.stringify({ message: result }), { status: 200 });
    } catch (error) {
        console.error("Error retreiving orders: ", error);
        return new NextResponse(JSON.stringify({ message: 'Er is een fout opgetreden' }), { status: 400 });
    }
}