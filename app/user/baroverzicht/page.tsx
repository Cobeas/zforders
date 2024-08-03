import RTDrinks from "@/app/components/RTDrinks";

export default async function BestelOverzicht() {

  return (
    <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <h1>Bar overzicht</h1>
      <RTDrinks />
    </div>
  );
}