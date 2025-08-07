"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/app";

export default function LoginPage() {
  const [email, setEmail] = useState<string | null>("");
  const [password, setPassword] = useState<string | null>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // todo: redirects
    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", res.token);

      setLoadingMessage("Login Successful...");

      alert("Login successful!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <h1>In User Creation page</h1>
    </div>
  );
}
