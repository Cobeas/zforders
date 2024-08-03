import RTOrders from "@/app/components/RTOrders";

export default async function BestelOverzicht() {

  return (
    <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <h1>Bestel overzicht</h1>
      <RTOrders />
    </div>
  );
}