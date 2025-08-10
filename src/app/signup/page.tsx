"use client";

import { useState } from "react";
import api from "@/lib/app";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SignupPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (password !== confirmPassword)
        throw new Error("Make sure passwords match");

      const res = await api.post("/auth/signup", {
        email,
        password,
        firstName,
        lastName,
      });

      if (!res) {
        throw new Error("Signup failed");
      }

      setLoadingMessage("Sign Up Successful...");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectToLonginPage = () => {
    setLoading(true);
    router.push("/");
    setLoadingMessage("Redirecting to login page...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-6 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-center">Sign Up</h2>

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
          <Label htmlFor="firstName" className="mb-1 block text-sm font-medium">
            First Name
          </Label>
          <Input
            type="text"
            id="firstName"
            placeholder="Your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="lastName" className="mb-1 block text-sm font-medium">
            Last Name
          </Label>
          <Input
            type="text"
            id="lastName"
            placeholder="Your Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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

        <div>
          <Label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium"
          >
            Confirm your password
          </Label>
          <Input
            type="password"
            id="confirmPassword"
            placeholder="Type your password again"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3.5 mt-6">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <>{loadingMessage}</> : "Create Account"}
            </Button>
            <Button
              type="button"
              onClick={redirectToLonginPage}
              disabled={loading}
              variant="ghost"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {loading ? <>{loadingMessage}</> : "Back to Login"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
