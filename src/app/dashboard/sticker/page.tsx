"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrState {
  qrBase64: string;
  tokenId: string;
  isActive: boolean;
}

interface VehicleCache {
  vehicleId: string;
  regNumber: string;
  make: string;
  model: string;
}

// QR sticker management. Persists the generated PNG + tokenId in localStorage for
// MVP (no GET-tokens endpoint yet). Owner phone never appears here.
export default function StickerPage() {
  const [qr, setQr] = useState<QrState | null>(null);
  const [vehicle, setVehicle] = useState<VehicleCache | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("qrcar_qr");
      if (stored) setQr(JSON.parse(stored));
      const v = localStorage.getItem("qrcar_vehicle");
      if (v) setVehicle(JSON.parse(v));
    } catch {
      // ignore malformed cache
    }
  }, []);

  function persist(next: QrState) {
    setQr(next);
    localStorage.setItem("qrcar_qr", JSON.stringify(next));
  }

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: vehicle?.vehicleId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate");
      persist({ qrBase64: data.qrBase64, tokenId: data.tokenId, isActive: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  async function toggle() {
    if (!qr) return;
    const next = !qr.isActive;
    try {
      const res = await fetch("/api/qr/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: qr.tokenId, isActive: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to toggle");
      persist({ ...qr, isActive: data.isActive });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to toggle");
    }
  }

  return (
    <main className="min-h-screen max-w-sm mx-auto px-6 py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500"
      >
        <ArrowLeft size={16} /> Dashboard
      </Link>

      {!qr ? (
        <div className="mt-10 text-center space-y-4">
          <h1 className="text-[22px] font-semibold">Generate your sticker</h1>
          <p className="text-sm text-gray-500">
            We&apos;ll create a unique QR code for your car.
          </p>
          <Button
            onClick={generate}
            disabled={loading}
            className="w-full rounded-xl py-4 h-auto"
          >
            Generate QR sticker
          </Button>
          {error && <p className="text-sm text-[#dc2626]">{error}</p>}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${qr.qrBase64}`}
              alt="QR sticker"
              className={`w-64 h-64 mx-auto rounded-xl ${
                qr.isActive ? "" : "grayscale opacity-40"
              }`}
            />
            {!qr.isActive && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
                  Paused
                </span>
              </span>
            )}
          </div>

          {vehicle && (
            <p className="text-sm text-gray-500 text-center">
              {vehicle.regNumber} · {vehicle.make} {vehicle.model}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sticker active</p>
              <p className="text-xs text-gray-500">Scanners can contact you</p>
            </div>
            <button
              onClick={toggle}
              role="switch"
              aria-checked={qr.isActive}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                qr.isActive ? "bg-[#16a34a]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                  qr.isActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <a
            download="qr-car-sticker.png"
            href={`data:image/png;base64,${qr.qrBase64}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-4 border border-gray-200 font-medium"
          >
            <Download size={18} /> Save PNG
          </a>

          <p className="text-xs text-gray-400 text-center">
            Print at A6 size · Apply to front and rear windshield
          </p>
          {error && <p className="text-sm text-[#dc2626] text-center">{error}</p>}
        </div>
      )}
    </main>
  );
}
