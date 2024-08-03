import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware';
import { limiter } from '@/app/lib/middleware';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
    const authResponse = authMiddleware(request);
    
    if (authResponse.status !== 200) {
        return new NextResponse(null, { status: authResponse.status });
    }

    const { bestelling_id } = await request.json();

    try {
        const result = await prisma.bestellingen.update({
            where: {
                bestelling_id: bestelling_id
            },
            data: {
                bezorgd: true
            }
        })

        await prisma.trigger_tabel.create({
            data: {
                used: true
            }
        })

        console.log("Sent order result: ", result);

        return new NextResponse(JSON.stringify({ message: 'Success' }), { status: 200 });
    } catch (error) {
        console.error("Error retreiving orders: ", error);
        return new NextResponse(JSON.stringify({ message: 'Er is een fout opgetreden' }), { status: 400 });
    }
}