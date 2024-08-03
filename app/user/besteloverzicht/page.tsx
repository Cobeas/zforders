import BestellingTabel from "./tabel";
import RTOrders from "@/app/components/RTOrders";

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

export default async function BestelOverzicht() {
  const response = await fetch("http://localhost:3000/api/orders/get");
  const data = await response.json();

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
      identifier: `drink${order.bestelling_id}`,
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
      if (order.is_snack) { // Filter op is_snack gelijk aan true
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
      identifier: `snack${order.bestelling_id}`,
      tafel: order.tafel,
      bar: order.bar,
      items: order.items.join(' | '),
      totaal_prijs: order.totaal_prijs,
      notities: order.notities,
    }));
  };

  const drinksArray = transformDrinks(data.message);
  const snacksArray = transformSnacks(data.message);

  return (
    <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <h1>Bestel overzicht</h1>
      {/* <BestellingTabel data={[...drinksArray, ...snacksArray]} /> */}
      <RTOrders />
    </div>
  );
}