"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import fetchWithToken from "@/app/lib/fetchWithToken";
import { useRouter } from "next/navigation";

export default function BestellingTabel({ data }: { data: any }) {
    const router = useRouter();
    const [barNr, setBarNr] = useState(0);

    useEffect(() => {
        const token = Cookies.get("zftoken");

        if (!token) {
            console.log("Geen token gevonden, redirecting naar login");
            router.push("/auth/login");
            return;
        }
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

    const filteredData = data.filter((order: any) => {
        if (barNr === 0) {
            return true;
        }

        return order.bar === barNr;
    });

    const deleteUnderscore = (str: string) => {
        // Replace all underscores with spaces
        return str.replaceAll(/_/g, " ");
    }

    return (
        <>
        <input type="number" placeholder="Bar nummer" onChange={(e) => setBarNr(parseInt(e.target.value))} />
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
                    {filteredData.map((order: any) => (
                        <tr key={order.identifier}>
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
        </>
    )
}