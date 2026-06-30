"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function post(url: string, body: object) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Something went wrong");
    return data;
  }

  async function sendOtp() {
    setError("");
    setLoading(true);
    try {
      await post("/api/auth/otp", { phone });
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setError("");
    setLoading(true);
    try {
      const { isNewUser } = await post("/api/auth/verify", { phone, code });
      if (isNewUser) {
        // Phone not registered — redirect to register
        router.push("/register");
      } else {
        router.push("/dashboard");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-black" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-[22px] font-semibold">Welcome back</h1>
              <p className="text-sm text-gray-500">Enter your phone to login.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number (with country code)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => {
                  let v = e.target.value.trim();
                  if (v && !v.startsWith("+")) v = "+" + v;
                  setPhone(v);
                }}
              />
              <p className="text-xs text-gray-400">Include country code — e.g. +91 for India</p>
            </div>
            <Button
              onClick={sendOtp}
              disabled={loading || phone.trim().length < 8}
              className="w-full rounded-xl py-4 h-auto bg-black text-white hover:bg-gray-900"
            >
              Send OTP
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-[22px] font-semibold">Enter code</h1>
              <p className="text-sm text-gray-500">Sent to {phone}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <Button
              onClick={verify}
              disabled={loading || code.length < 6}
              className="w-full rounded-xl py-4 h-auto bg-black text-white hover:bg-gray-900"
            >
              Login
            </Button>
            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              className="text-sm text-gray-500 underline w-full text-center"
            >
              Resend code
            </button>
          </div>
        )}

        {error && <p className="text-sm text-[#dc2626]">{error}</p>}

        <p className="text-xs text-center text-gray-400">
          No account?{" "}
          <Link href="/register" className="underline text-black">
            Register your car
          </Link>
        </p>
      </div>
    </main>
  );
}
