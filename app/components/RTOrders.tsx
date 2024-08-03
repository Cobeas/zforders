"use client";

import { useEffect, useState } from "react";
import fetchWithToken from "@/app/lib/fetchWithToken";

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

const RTOrders = () => {
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

    const sendOrder = async (id: number) => {
        console.log('Sending order with id: ', id);
        try {
            const response = await fetchWithToken('/api/orders/send', {
                method: 'POST',
                body: JSON.stringify({ bestelling_id: id })
            });

            if (response.status === 200) {
                console.log("Order sent successfully");
            } else {
                console.error("Error sending order: ", response);
            }
        } catch (error) {
            console.error("Error sending order: ", error);
        }
    }

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

    function transformSnacks(orders: Order[]): TransformedOrder[] {
      const groupedOrders = orders.reduce<Record<number, {
        bestelling_id: number;
        tafel: number;
        bar: number;
        items: string[];
        totaal_prijs: number;
        notities: string;
      }>>((acc, order) => {
        if (order.is_snack) { // Filter op is_snack gelijk aan false
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

    const deleteUnderscore = (str: string) => {
        return str.replaceAll(/_/g, " ");
    }

    const newData = [...transformDrinks(data), ...transformSnacks(data)];

    return (
        <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <input type="number" placeholder="Bar nummer" min="1" defaultValue="1" onChange={(e) => setBarNr(parseInt(e.target.value))} />
            <div style={{width: '100%', padding: '20px'}}>
                <table>
                    <thead>
                        <tr>
                            <th style={{width: '5%', minWidth: '50px'}}>Tafel</th>
                            <th style={{width: '5%', minWidth: '50px'}}>Bar</th>
                            <th style={{width: '40%'}}>Items</th>
                            <th style={{width: '5%', minWidth: '50px'}}>Totaal prijs</th>
                            <th style={{width: '35%'}}>Notities</th>
                            <th style={{width: '10%'}}>Actie</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newData.map((order: TransformedOrder) => (
                            <tr key={`${order.bar}${order.tafel}${order.bestelling_id}`}>
                                <td style={{width: '5%', minWidth: '50px'}}>{order.tafel}</td>
                                <td style={{width: '5%', minWidth: '50px'}}>{order.bar}</td>
                                <td style={{width: '40%'}}>{deleteUnderscore(order.items)}</td>
                                <td style={{width: '5%', minWidth: '50px'}}>{order.totaal_prijs}</td>
                                <td style={{width: '35%'}}>{order.notities}</td>
                                <td style={{width: '10%'}}><button onClick={(e) => {e.preventDefault(); sendOrder(order.bestelling_id)}}>Verstuur</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RTOrders;