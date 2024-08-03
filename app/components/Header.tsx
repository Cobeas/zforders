"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import logo from '../../public/images/logo.png'
import './components.css';

export default function Header() {
    const router = useRouter();

    function handleRoute(route: string) {
        router.push(route);
    }

    return (
        <header>
            {/* Desktop header */}
            <div className="desktop-header">
                <Image
                    src={logo}
                    alt="Logo"
                    width={212}
                    height={75}
                />
                <div style={{display: 'flex'}}>
                    <button className="normal-btn" onClick={() => handleRoute('/user/bestelformulier')}>Bestelformulier</button>
                    <button className="normal-btn" onClick={() => handleRoute('/user/besteloverzicht')}>Besteloverzicht</button>
                    <button className="normal-btn" onClick={() => handleRoute('/user/baroverzicht')}>Baroverzicht</button>
                    <button className="normal-btn" onClick={() => handleRoute('/user/keukenoverzicht')}>Keukenoverzicht</button>
                    <button className="normal-btn" onClick={() => handleRoute('/auth/instellingen')}>Instellingen</button>
                </div>
            </div>

            {/* Mobile header */}
            <div className="mobile-header">
                <Image
                    src={logo}
                    alt="Logo"
                    width={212}
                    height={75}
                />
            </div>
        </header>
    )
}