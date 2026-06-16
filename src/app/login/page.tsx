"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("signup data", data);
    console.log("signup error", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created. Now click Sign In.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">Budget Buddy</h1>

        <input
          className="w-full border rounded p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          className="w-full rounded bg-black text-white p-2"
        >
          Sign In
        </button>

        <button onClick={signUp} className="w-full rounded border p-2">
          Create Account
        </button>
      </div>
    </main>
  );
}
