"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function BestellingTabel({ data }: { data: any }) {
    const router = useRouter();
    const [barNr, setBarNr] = useState(1);

    useEffect(() => {
        const token = Cookies.get("zftoken");

        if (!token) {
            console.log("Geen token gevonden, redirecting naar login");
            router.push("/auth/login");
            return;
        }
    }, []);

    const filteredData = data.filter((order: any) => {
        if (barNr === 0) {
            return true;
        }

        return order.bar === barNr;
    });

    const deleteUnderscore = (str: string) => {
        return str.replaceAll(/_/g, " ");
    }

    return (
        <>
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
                    {filteredData.map((order: any) => (
                        <tr key={order.identifier}>
                            <td style={{width: '5%', minWidth: '50px'}}>{order.tafel}</td>
                            <td style={{width: '55%'}}>{deleteUnderscore(order.items)}</td>
                            <td style={{width: '40%'}}>{order.notities}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    )
}