import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware';
import { limiter } from '@/app/lib/middleware';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
    const authResponse = authMiddleware(request);
    
    if (authResponse.status !== 200) {
        return new NextResponse(null, { status: authResponse.status });
    }

    const { tafelnummer, drank, snacks, notities } = await request.json();
    console.log("Order request: ", { tafelnummer, drank, snacks, notities });
    try {

        const drankArray = Object.entries(drank);
        const snacksArray = Object.entries(snacks);

        const barNr = await prisma.bar_tafel_relatie.findFirst({
          where: {
            tafel_id: parseInt(tafelnummer, 10)
          },
          select: {
            bar_id: true
          }
        });

        console.log("Bar number: ", barNr);

        // For all drinks in the order, find the product_id from the producten table and insert into bestelling_product with the amount and bestelling_id
        if (drankArray.length > 0) {

          const drinkOrder = await prisma.bestellingen.create({
            data: {
              tafel: parseInt(tafelnummer, 10),
              notities: notities,
              bar: barNr!.bar_id,
            },
            select: {
              bestelling_id: true,
            }
          });
          console.log("Drink order: ", drinkOrder);

          for (const [product_naam, aantal] of drankArray) {
              const product = await prisma.producten.findFirst({
                where: {
                  product_naam: product_naam
                },
                select: {
                  product_id: true
                }
              });

              await prisma.bestelling_product.create({
                data: {
                  bestelling_id: drinkOrder.bestelling_id,
                  product_id: product!.product_id,
                  aantal: parseInt(aantal as string, 10)
                }
              });
            }
          }

        // For all snacks in the order, find the product_id from the snacks table and insert into bestelling_product with the amount and bestelling_id
        if (snacksArray.length > 0) {

          const snackOrder = await prisma.bestellingen.create({
            data: {
              tafel: parseInt(tafelnummer, 10),
              notities: notities,
              bar: barNr!.bar_id,
            },
            select: {
              bestelling_id: true,
            }
          });
          console.log("Snack order: ", snackOrder);

          for (const [product_naam, aantal] of snacksArray) {
            const product = await prisma.snacks.findFirst({
              where: {
                snack_naam: product_naam
              },
              select: {
                snack_id: true
              }
            });

            await prisma.bestelling_product.create({
              data: {
                bestelling_id: snackOrder.bestelling_id,
                snack_id: product!.snack_id,
                aantal: parseInt(aantal as string, 10)
              }
            });
          }
        }

        await prisma.trigger_tabel.create({
          data: {
            used: true
          }
        })

        console.log("New order placed successfully");
        const result = true;
        
        if (result === null) {
            return new NextResponse(JSON.stringify({ message: 'Order failed' }), { status: 400 });
        }

        return new NextResponse(JSON.stringify({ message: result }), { status: 200 });
    } catch (error) {
        console.error("Error processing order: ", error);
        return new NextResponse(JSON.stringify({ message: 'Order failed', error }), { status: 400 });
    }
}