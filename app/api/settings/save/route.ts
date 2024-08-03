import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware';
import { limiter } from '@/app/lib/middleware';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
    const authResponse = authMiddleware(request);
    
    if (authResponse.status !== 200) {
        return new NextResponse(null, { status: authResponse.status });
    }

    const { dranken, snacks, barcount, barindeling } = await request.json();
    try {
        const result = await prisma.$executeRaw`
            SELECT update_tables(
                ${JSON.stringify(dranken)}::jsonb,
                ${JSON.stringify(snacks)}::jsonb,
                ${JSON.stringify(barindeling)}::jsonb,
                ${barcount}::int
            )
        `;

        console.log("Update result: ", result);

        return new NextResponse(JSON.stringify({ message: result }), { status: 200 });
    } catch (error) {
        console.error("Error updating tables: ", error);
        return new NextResponse(JSON.stringify({ message: 'Er ging iets mis bij het updaten' }), { status: 400 });
    }
}