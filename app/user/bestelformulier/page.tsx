"use client";

import { useState, useEffect, FormEvent, use } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import fetchWithToken from "@/app/lib/fetchWithToken";
import styles from './formulier.module.css';

interface Item {
    [key: string]: number;
}

interface Settings {
    snacks: Item[];
    dranken: Item[];
    tafelcount: number;
    barcount: number;
    barindeling: string[];
}

interface Message {
    message: string;
    color: string;
}

interface OrderData {
    tafelnummer: number;
    prijs: string;
}

export default function BestelFormulier() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [checkedDrinks, setCheckedDrinks] = useState<any>({});
    const [checkedSnacks, setCheckedSnacks] = useState<any>({});
    const [bestellingDrank, setBestellingDrank] = useState<{ [key: string]: string }>({});
    const [bestellingSnack, setBestellingSnack] = useState<{ [key: string]: string }>({});
    const [message, setMessage] = useState<Message>({ message: '', color: 'green' });
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [settings, setSettings] = useState<Settings>({
        snacks: [],
        dranken: [],
        tafelcount: 0,
        barcount: 0,
        barindeling: [],
    });

    useEffect(() => {
        const token = Cookies.get("zftoken");

        if (!token) {
        router.push("/auth/login");
        return;
        } else {
        getDatabaseSettings();
        }

    }, []);

    const getDatabaseSettings = async () => {
        try {
            const response = await fetchWithToken("/api/settings/get", {
                method: "GET",
            });
            const responseData = await response.json();
            const settingsData = responseData.message[0].instellingen;
    
            // Vul checkedDrinks en checkedSnacks met false waarden
            const initialCheckedDrinks: { [key: string]: boolean } = {};
            const initialCheckedSnacks: { [key: string]: boolean } = {};
    
            settingsData.dranken.forEach((item: any) => {
                for (const key in item) {
                    let newKey = key.replaceAll('_', ' ');
                    for (let i = 1; i <= 5; i++) {
                        initialCheckedDrinks[newKey + i] = false;
                    }
                }
            });
    
            settingsData.snacks.forEach((item: any) => {
                for (const key in item) {
                    let newKey = key.replaceAll('_', ' ');
                    for (let i = 1; i <= 5; i++) {
                        initialCheckedSnacks[newKey + i] = false;
                    }
                }
            });
    
            setSettings(settingsData);
            setCheckedDrinks(initialCheckedDrinks);
            setCheckedSnacks(initialCheckedSnacks);
        } catch (error) {
            console.error("Er is iets misgegaan", error);
        }
        setLoading(false);
    };    

    const itemArray = (input: Array<{ [key: string]: number }>): string[] => {
        return input.map(item => Object.keys(item)[0].replaceAll('_', ' '));
    };

    const checkSelection = (product: string, n: number, _index: number, checked: boolean, type: string) => {
        const value = n.toString();
        const newCheckedDrinks = { ...checkedDrinks };
        const newCheckedSnacks = { ...checkedSnacks };
    
        if (type === 'drank') {
            for (const key in checkedDrinks) {
                if (key.includes(product) && key !== product + value) {
                    newCheckedDrinks[key] = false;
                }
            }
            newCheckedDrinks[`${product + value}`] = checked;
            setCheckedDrinks(newCheckedDrinks);
        } else if (type === 'snack') {
            for (const key in checkedSnacks) {
                if (key.includes(product) && key !== product + value) {
                    newCheckedSnacks[key] = false;
                }
            }
            newCheckedSnacks[`${product + value}`] = checked;
            setCheckedSnacks(newCheckedSnacks);
        }
    
        if (checked && type === 'drank') {
            setBestellingDrank({ ...bestellingDrank, [product]: value });
        } else if (checked && type === 'snack') {
            setBestellingSnack({ ...bestellingSnack, [product]: value });
        } else if (!checked && type === 'drank') {
            const updatedBestellingDrank = { ...bestellingDrank };
            delete updatedBestellingDrank[product];
            setBestellingDrank(updatedBestellingDrank);
        } else if (!checked && type === 'snack') {
            const updatedBestellingSnack = { ...bestellingSnack };
            delete updatedBestellingSnack[product];
            setBestellingSnack(updatedBestellingSnack);
        }
    };    

    const removeItem = (item: any) => {
        for (const value in item) {
            if (item[value] === "0") {
                delete item[value];
            }
        }

        return item;
    }

    const lowerCaseKeys = (obj: any) => {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key.replaceAll(' ', '_').toLowerCase()] = obj[key];
        }
        return newObj;
    }

    const resetForm = () => {
        setBestellingDrank({});
        setBestellingSnack({});
        
        // Reset checkboxes
        const newCheckedDrinks = { ...checkedDrinks };
        const newCheckedSnacks = { ...checkedSnacks };
        for (const key in checkedDrinks) {
            newCheckedDrinks[key] = false;
        }
        for (const key in checkedSnacks) {
            newCheckedSnacks[key] = false;
        }
    }

    const sendOrder = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage({ message: '', color: 'green' });
        const formData = new FormData(e.currentTarget);
      
        if (formData.get('tafelnr') === '') {
          console.log('Tafelnummer is verplicht');
          setMessage({ message: 'Tafelnummer is verplicht', color: 'red' });
          window.scrollTo(0, document.body.scrollHeight);
          return;
        }
        if (Object.keys(bestellingDrank).length === 0 && Object.keys(bestellingSnack).length === 0) {
          setMessage({ message: 'Bestel minstens 1 product', color: 'red' });
          window.scrollTo(0, document.body.scrollHeight);
          return;
        }

        if (parseInt(formData.get('tafelnr') as string) > settings.tafelcount) {
            setMessage({ message: `Tafelnummer mag niet hoger zijn dan ${settings.tafelcount}`, color: 'red' });
            window.scrollTo(0, document.body.scrollHeight);
            return;
        }
      
        const data = {
          tafelnummer: formData.get('tafelnr'),
          drank: lowerCaseKeys(removeItem(bestellingDrank)),
          snacks: lowerCaseKeys(removeItem(bestellingSnack)),
          notities: formData.get('notities'),
        };
        //console.log(data);
        let prijs = 0;

        for (const key in data.drank) {
            //console.log('Key:', key);
            const found = settings.dranken.find((element: any) => Object.keys(element)[0] === key);
            if (found) {
                prijs += found[key] * parseInt(data.drank[key]);
            }
            //console.log('Prijs:', prijs);
        }
        for (const key in data.snacks) {
            //console.log('Key:', key);
            const found = settings.snacks.find((element: any) => Object.keys(element)[0] === key);
            if (found) {
                prijs += found[key] * parseInt(data.snacks[key]);
            }
            //console.log('Prijs:', prijs);
        }
        
        setOrderData({ tafelnummer: parseInt(formData.get('tafelnr') as string), prijs: prijs.toString() });
      
        try {
          const response = await fetchWithToken("/api/orders/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
      
          const responseData = await response.json();
      
          if (response.ok) {
            setMessage({ message: 'Bestelling geplaatst', color: 'green' });
          } else {
            setMessage({ message: responseData.message, color: 'red' });
          }
        } catch (error) {
          console.error('Er is iets misgegaan', error);
          setMessage({ message: 'Er is iets misgegaan', color: 'red' });
        }

        resetForm();
        window.scrollTo(0, document.body.scrollHeight);
    };

    useEffect(() => {
        console.log('Bestelling drank:', bestellingDrank);
        console.log('Bestelling snack:', bestellingSnack);
    }, [bestellingDrank, bestellingSnack]);

    if (loading) {
        return <p>🍻Bier halen, zo terug...🍻</p>;
    }

    return (
        <>
        <h1>Bestelformulier</h1>
        <form 
            style={{marginTop: '20px', minWidth: '300px', maxWidth: '350px'}}
            onSubmit={sendOrder}
            onReset={() => resetForm()}
            className={styles["bestel-tabel"]}
        >
            <label htmlFor="tafelnr">Tafelnummer</label>
            <input type="number" id="tafelnr" name="tafelnr" className={styles.nrinput} />
            <div>
                <table className={styles["dranken-tabel"]}>
                    <thead>
                    <tr>
                        <th>Product</th>
                        <th>1</th>
                        <th>2</th>
                        <th>3</th>
                        <th>4</th>
                        <th>5</th>
                    </tr>
                    </thead>
                    <tbody>
                        {!loading && settings.dranken !== null ? itemArray(settings.dranken).map((product, index) => (
                            <tr key={index}>
                                <td>{product}</td>
                                {[1, 2, 3, 4, 5].map(value => (
                                    <td key={value}>
                                        <input 
                                            type="checkbox" 
                                            checked={checkedDrinks[product + value]} 
                                            className={styles.chbx} 
                                            id={product + index} 
                                            value={value} 
                                            onChange={(e) => checkSelection(product, value, index, e.currentTarget.checked, 'drank')} 
                                        />
                                    </td>
                                ))}
                            </tr>
                        )) : null}
                    </tbody>
                </table>
                <table className={styles["snacks-tabel"]}>
                    <thead>
                    <tr>
                        <th>Product</th>
                        <th>1</th>
                        <th>2</th>
                        <th>3</th>
                        <th>4</th>
                        <th>5</th>
                    </tr>
                    </thead>
                    <tbody>
                        {!loading && settings.snacks !== null ? itemArray(settings.snacks).map((product, index) => (
                            <tr key={index}>
                                <td>{product}</td>
                                {[1, 2, 3, 4, 5].map(value => (
                                    <td key={value}>
                                        <input 
                                            type="checkbox" 
                                            checked={checkedSnacks[product + value]} 
                                            className={styles.chbx} 
                                            id={product + index} 
                                            value={value} 
                                            onChange={(e) => checkSelection(product, value, index, e.currentTarget.checked, 'snack')} 
                                        />
                                    </td>
                                ))}
                            </tr>
                        )) : null}
                    </tbody>
                </table>
                <div style={{marginTop: '20px', position: 'relative', height: '150px', width: '100%'}}>
                    <label htmlFor="notities">Notities</label>
                    <textarea className={styles.txtarea} id="notities" name="notities" />
                    <button type="submit" style={{position: 'absolute', bottom: 0, left: 0}}>Bestellen</button>
                    <button type="reset" style={{position: 'absolute', bottom: 0, right: 0}}>Reset</button>
                </div>
            </div>
        </form>
        <div style={{display: 'flex', flexDirection: 'column', alignContent: 'flex-start', justifyContent: 'flex-start', width: '100%', maxWidth: '350px', marginTop: '20px'}}>
            {message.message !== '' ? <p style={{ color: message.color, fontWeight: 'bold' }}>{message.message}</p> : null}
            <p>Prijs: {orderData?.prijs ? `${orderData.prijs} munten` : null}</p>
            <p>Tafel nr: {orderData?.tafelnummer ? orderData.tafelnummer : null}</p>
        </div>
        </>
    );
}