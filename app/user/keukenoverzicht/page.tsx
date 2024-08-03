import RTSnacks from "@/app/components/RTSnacks";

export default async function KeukenOverzicht() {

  return (
    <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <h1>Keuken overzicht</h1>
      <RTSnacks />
    </div>
  );
}