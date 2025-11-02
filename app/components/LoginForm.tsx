"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const { login } = useAuth();
  //const [email, setEmail] = useState("");
  const email = "zesidor@gmail.com";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      login(data.token);
      router.push("/wykres");
      setMessage("Logged in successfully!");
    } else {
      setMessage(data.error || "Uo Panie, bez hasła nie da rady!");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm">
      {/*<input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2"
      />*/}
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2"
      />
      <button type="submit" className="bg-cyan-800 text-white p-2 cursor-pointer">
        Dalej
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
