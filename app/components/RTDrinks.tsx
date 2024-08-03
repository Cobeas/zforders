"use client";

import { useEffect, useState } from "react";

type Order = {
    bestelling_id: number;
    tafel: number;
    bar: number;
    item_naam: string;
    aantal: number;
    notities: string;
    totaal_prijs_per_item: number;
    is_snack: boolean;
  };
  
  type TransformedOrder = {
    bestelling_id: number;
    tafel: number;
    bar: number;
    items: string;
    totaal_prijs: number;
    notities: string;
  };

const RTDrinks = () => {
    const [data, setData] = useState<Order[]>([]);
    const [barNr, setBarNr] = useState(1);

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';
        const ws = new WebSocket(wsUrl);
    
        ws.onopen = () => {
            console.log('WebSocket connection established with', wsUrl);
        };
    
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.event === 'open_orders') {
                setData(message.data);
            }
        };
    
        ws.onclose = () => {
            console.log('WebSocket connection closed.');
        };
    
        return () => {
            ws.close();
        };
    
    }, []);

    function transformDrinks(orders: Order[]): TransformedOrder[] {
      const groupedOrders = orders.reduce<Record<number, {
        bestelling_id: number;
        tafel: number;
        bar: number;
        items: string[];
        totaal_prijs: number;
        notities: string;
      }>>((acc, order) => {
        if (!order.is_snack) { // Filter op is_snack gelijk aan false
          if (!acc[order.bestelling_id]) {
            acc[order.bestelling_id] = {
              bestelling_id: order.bestelling_id,
              tafel: order.tafel,
              bar: order.bar,
              items: [],
              totaal_prijs: 0,
              notities: order.notities,
            };
          }
          acc[order.bestelling_id].items.push(`${order.item_naam} ${order.aantal}`);
          acc[order.bestelling_id].totaal_prijs += order.totaal_prijs_per_item;
        }
        return acc;
      }, {});
    
      return Object.values(groupedOrders).map(order => ({
        bestelling_id: order.bestelling_id,
        tafel: order.tafel,
        bar: order.bar,
        items: order.items.join(' | '),
        totaal_prijs: order.totaal_prijs,
        notities: order.notities,
      }));
    };

    const filteredData = transformDrinks(data).filter((order: TransformedOrder) => {
        if (barNr === 0) {
            return true;
        }

        return order.bar === barNr;
    });

    const deleteUnderscore = (str: string) => {
        return str.replaceAll(/_/g, " ");
    }

    return (
        <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <input type="number" placeholder="Bar nummer" min="1" defaultValue="1" onChange={(e) => setBarNr(parseInt(e.target.value))} />
            <div style={{width: '100%', padding: '20px'}}>
                <table>
                    <thead>
                        <tr>
                            <th style={{width: '5%', minWidth: '50px'}}>Tafel</th>
                            <th style={{width: '55%'}}>Items</th>
                            <th style={{width: '40%'}}>Notities</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((order: TransformedOrder) => (
                            <tr key={order.bestelling_id}>
                                <td style={{width: '5%', minWidth: '50px'}}>{order.tafel}</td>
                                <td style={{width: '55%'}}>{deleteUnderscore(order.items)}</td>
                                <td style={{width: '40%'}}>{order.notities}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RTDrinks;