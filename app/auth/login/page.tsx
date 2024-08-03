"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const LoginPage = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });
    
        const data = await response.json();
    
        if (response.ok) {

          Cookies.set("zftoken", data.accessToken, {
            expires: 1 / 3,
            path: '/',
            //secure: process.env.NODE_ENV === 'production',
            secure: false,
            sameSite: 'strict',
          });
          Cookies.set("refreshToken", data.refreshToken, {
            expires: 7,
            path: '/',
            //secure: process.env.NODE_ENV === 'production',
            secure: false,
            sameSite: 'strict',
          });
          router.push("/user/bestelformulier");
        } else {
          setError(data.message || "Fout bij inloggen");
        }
      };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="password">Wachtwoord</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p style={{color: 'red'}}>{error}</p>}
                <button type="submit">Inloggen</button>
            </form>
        </div>
    )
}

export default LoginPage;