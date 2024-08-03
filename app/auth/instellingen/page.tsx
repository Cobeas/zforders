"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import fetchWithToken from "@/app/lib/fetchWithToken";
import './instellingen.css';

interface Message {
  message: string;
  color: "green" | "red";
}

export default function Instellingen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message>({ message: '', color: 'green' });
  const [barIndeling, setBarIndeling] = useState<number[]>([]);
  const [tafelCount, setTafelCount] = useState<number>(0);
  const [barCount, setBarCount] = useState<number>(0);
  const [dranken, setDranken] = useState<any>([{ '': '' }]);
  const [snacks, setSnacks] = useState<any>([{ '': '' }]);

  useEffect(() => {
    getDatabaseSettings();
  }, []);

  const getDatabaseSettings = async () => {
    try {
        const response = await fetchWithToken("/api/settings/get", {
            method: "GET",
        });
        const responseData = await response.json();
        console.log('Response data:', JSON.stringify(responseData.message[0].instellingen));
        const newBarIndeling = responseData.message[0].instellingen.barindeling.splice(1);
        setBarIndeling(newBarIndeling);
        setBarCount(responseData.message[0].instellingen.barcount);
        setTafelCount(responseData.message[0].instellingen.tafelcount);
        setDranken(parsedArray(responseData.message[0].instellingen.dranken));
        setSnacks(parsedArray(responseData.message[0].instellingen.snacks));
        setLoading(false);
    } catch (error) {
        console.error("Er is iets misgegaan", error);
    }
  };

  const resetDatabase = async () => {
    const confirmation = confirm("Weet je zeker dat je de database wilt resetten?");
    if (!confirmation) {
      return;
    }

    console.log("Database resetten");
    try {
      const response = await fetchWithToken("/api/settings/reset", {
        method: "POST",
      });
      const responseData = await response.json();
      console.log(responseData);

      if (response.ok) {
        setMessage({ message: 'Database gereset', color: 'green' });
        getDatabaseSettings();
      } else {
        setMessage({ message: responseData.message, color: 'red' });
      }
    } catch (error) {
      console.error("Er is iets misgegaan", error);
      setMessage({ message: 'Er ging iets mis', color: 'red' });
    }
  };

  const parsedArray = (array: any) => {
    if (array === null) {
      return [{ '': '' }];
    }

    if (array.length === 0) {
      return [{ '': '' }];
    }

    return (
      array.map((obj: any) => {
        const key = Object.keys(obj)[0];
        const nieuweKey = key.replace(/_/g, ' ');
        return { [nieuweKey]: obj[key] };
      })
    )
  }

  const stringedArray = (array: any) => {
    if (array.length === 0) {
      return '[]';
    }

    return (
      array.map((obj: any) => {
        const key = Object.keys(obj)[0];
        const nieuweKey = key.replace(/ /g, '_').toLowerCase();
        return { [nieuweKey]: obj[key] };
      })
    )
  }

  const handleRadioChange = (tafel: number, bar: number) => {
    const newBarIndeling = [...barIndeling];
    newBarIndeling[tafel] = bar;
    setBarIndeling(newBarIndeling);
  };

  const updateDrankName = (index: number, value: string) => {
    setDranken((prevDranken: any) => {
      const newProducten = [...prevDranken];
      const productKey = Object.keys(newProducten[index])[0];
      const productValue = newProducten[index][productKey];
      newProducten[index] = { [value]: productValue };
      return newProducten;
    });
  };

  const updateDrankPrice = (index: number, value: number) => {
    setDranken((prevDranken: any) => {
      const newProducten = [...prevDranken];
      const productKey = Object.keys(newProducten[index])[0];
      newProducten[index] = { [productKey]: parseFloat(value.toString()) };
      return newProducten;
    });
  };

  const nieuweDrank = (index: number) => {
    setDranken((prevDranken: any) => {
      const newProducten = [...prevDranken];
      newProducten.splice(index + 1, 0, { '': '' });
      return newProducten;
    });
  };

  const verwijderDrank = (index: number) => {
    setDranken((prevDranken: any) => {
      const newProducten = [...prevDranken];
      newProducten.splice(index, 1);
      return newProducten;
    });
  };

  const updateSnackName = (index: number, value: string) => {
    setSnacks((prevSnacks: any) => {
      const newProducten = [...prevSnacks];
      const productKey = Object.keys(newProducten[index])[0];
      const productValue = newProducten[index][productKey];
      newProducten[index] = { [value]: productValue };
      return newProducten;
    });
  };

  const updateSnackPrice = (index: number, value: number) => {
    setSnacks((prevSnacks: any) => {
      const newProducten = [...prevSnacks];
      const productKey = Object.keys(newProducten[index])[0];
      newProducten[index] = { [productKey]: parseFloat(value.toString()) };
      return newProducten;
    });
  };

  const nieuweSnack = (index: number) => {
    setSnacks((prevSnacks: any) => {
      const newProducten = [...prevSnacks];
      newProducten.splice(index + 1, 0, { '': '' });
      return newProducten;
    });
  };

  const verwijderSnack = (index: number) => {
    setSnacks((prevSnacks: any) => {
      const newProducten = [...prevSnacks];
      newProducten.splice(index, 1);
      return newProducten;
    });
  }

  const updateDb = async () => {
    setMessage({ message: '', color: 'green' });
    const payload = {
      dranken: stringedArray(dranken),
      snacks: stringedArray(snacks),
      barcount: barCount,
      tafelcount: tafelCount,
      barindeling: barIndeling[0] === null ? [...barIndeling] : [null, ...barIndeling],
    }
    console.log(JSON.stringify(payload));

    try {
      const response = await fetchWithToken("/api/settings/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      console.log(responseData);
      
      if (response.ok) {
        setMessage({ message: 'Database geüpdatet', color: 'green' });
      } else {
        setMessage({ message: responseData.message, color: 'red' });
      }

    } catch (error) {
      console.error(error);
      setMessage({ message: 'Er ging iets mis', color: 'red' });
    }
  }

  const getDb = async () => {
    try {
      const response = await fetchWithToken("/api/settings/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();
      console.log(responseData);

      if (response.ok) {
        setMessage({ message: 'Database opgehaald', color: 'green' });
      } else {
        setMessage({ message: responseData.message, color: 'red' });
      }

    } catch (error) {
      console.error(error);
      setMessage({ message: 'Er ging iets mis', color: 'red' });
    }
  }
  
  useEffect(() => {
    const token = Cookies.get("zftoken");

    if (!token) {
      router.push("/auth/login");
      return;
    } else {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    for (let i = 0; i < barIndeling.length; i++) {
      console.log('Tafel', i + 1, 'Bar', barIndeling[i]);
      console.log(typeof barIndeling[i]);
    }
  }, [barIndeling]);

  if (loading) {
    return <p>🍻Bier halen, zo terug...🍻</p>;
  }

  return (
    <>
    <h1>Server instellingen</h1>
    {message.message !== '' && <p style={{ color: message.color, fontWeight: 'bold' }}>{message.message}</p>}
    <div className="toprow" style={{display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', padding: '15px'}}>
      <div className="smallfull" style={{display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'flex-start'}}>
        <p>Bar indeling:</p>
        <table>
          <thead>
            <tr style={{textAlign: 'left'}}>
              <th className="smallbigger" style={{width: '30%'}}>
                Tafels
                <input type="number" className="count-input" style={{width: '30%', margin: '0 5px'}} onChange={(e) => setTafelCount(parseInt(e.currentTarget.value))} value={tafelCount as number} />
                <button className="count-check" >✔</button>
              </th>
              <th>
                Bar
                <input type="number" className="count-input" style={{width: '30%', margin: '0 5px'}} onChange={(e) => setBarCount(parseInt(e.currentTarget.value))} value={barCount as number} />
                <button className="count-check" >✔</button>
              </th>
            </tr>
          </thead><tbody>
{Array.from({ length: tafelCount }, (_, tafel) => tafel).map(tafel => (
  <tr key={tafel}>
    <td className="smallbigger" style={{width: '30%'}}>{tafel + 1}</td>
    <td>
      {Array.from({ length: barCount }, (_, bar) => bar + 1).map(bar => (
        <label key={bar}>
          Bar {bar}
          <input
            type="radio"
            name={`tafel${tafel}`}
            value={bar}
            checked={String(barIndeling[tafel]) === String(bar)}
            onChange={() => handleRadioChange(tafel, bar)}
            style={{margin: '0 20px 0 5px'}}
          />
        </label>
      ))}
    </td>
  </tr>
))}
</tbody>
        </table>
      </div>
      <div className="smallfull" style={{display: 'flex', flexDirection: 'column', width: '50%', alignItems: 'flex-start'}}>
      <h4>Dranken</h4>
      <table className="producten-tabel">
        <thead>
          <tr>
            <th>Product</th>
            <th>Prijs</th>
          </tr>
        </thead>
        <tbody>
          {dranken.map((product: any, index: number) => (
            <tr key={index}>
              <td>
                <input
                  value={Object.keys(product)[0]}
                  onChange={(e) => updateDrankName(index, e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={(Object.values(product)[0] as number)}
                  onChange={(e) => updateDrankPrice(index, parseFloat(e.target.value))}
                />
              </td>
              <td>
                <button className="plus-button" onClick={() => nieuweDrank(index)}>+</button>
              </td>
              <td>
                <button className="plus-button" disabled={dranken.length <= 1} onClick={() => verwijderDrank(index)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 style={{marginTop: '20px'}}>Snacks</h4>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Prijs</th>
          </tr>
        </thead>
        <tbody>
          {snacks.map((product: any, index: number) => (
            <tr key={index}>
              <td>
                <input
                  value={Object.keys(product)[0]}
                  onChange={(e) => updateSnackName(index, e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={(Object.values(product)[0] as number)}
                  onChange={(e) => updateSnackPrice(index, parseFloat(e.target.value))}
                />
              </td>
              <td>
                <button className="plus-button" onClick={() => nieuweSnack(index)}>+</button>
              </td>
              <td>
                <button className="plus-button" disabled={snacks.length <= 1} onClick={() => verwijderSnack(index)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
    <h4 style={{marginTop: '20px', paddingLeft: '15px', width: '100%', textAlign: 'left'}}>Overige instellingen</h4>
    <div style={{display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', padding: '15px'}}>
      <div style={{marginTop: '20px', position: 'relative', height: '75px', width: '50%', paddingLeft: '15px'}}>
        <button type="submit" style={{cursor: 'pointer'}} onClick={updateDb}>Opslaan</button>
        <button type="button" style={{marginLeft: '10px', cursor: 'pointer'}} onClick={getDb}>Ophalen</button>
      </div>
      <div style={{marginTop: '20px', width: '50%', display: 'flex', flexDirection: 'column', border: '1px solid red', borderRadius: '15px'}}>
          <h4 style={{padding: '15px', textAlign: 'left'}}>Database</h4>
          <p style={{padding: '15px', textAlign: 'left'}}>Database naam: <span style={{fontWeight: 'bold'}}>zforders</span></p>
          <p style={{padding: '15px', textAlign: 'left'}}>Database versie: <span style={{fontWeight: 'bold'}}>1.0.0</span></p>
          <button onClick={() => resetDatabase()} style={{padding: '15px', margin: '10px', width: '150px', backgroundColor: 'red', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer'}}>Reset database</button>
      </div>
    </div>
    </>
  );
}