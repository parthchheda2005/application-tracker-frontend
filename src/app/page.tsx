"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/app";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res) {
        throw new Error("Login failed");
      }

      localStorage.setItem("token", res.data.token);
      setLoadingMessage("Login Successful...");
      router.push("/menu");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectToCreateUser = () => {
    setLoading(true);
    router.push("/signup");
    setLoadingMessage("Redirecting to user creation page...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-6 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        <div>
          <Label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </Label>
          <Input
            type="password"
            id="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex flex-col gap-3.5">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <>{loadingMessage}</> : "Login"}
          </Button>
          <Button
            type="button"
            onClick={redirectToCreateUser}
            disabled={loading}
            className="w-full"
          >
            {loading ? <>{loadingMessage}</> : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
