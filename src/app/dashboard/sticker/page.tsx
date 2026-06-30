"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrState {
  qrBase64: string;
  tokenId: string;
  isActive: boolean;
}

interface Vehicle {
  id: string;
  regNumber: string;
  make: string;
  model: string;
  color: string;
}

export default function StickerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <StickerContent />
    </Suspense>
  );
}

function StickerContent() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId") ?? "";

  const [qr, setQr] = useState<QrState | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const qrKey = vehicleId ? `qrcar_qr_${vehicleId}` : "qrcar_qr";

  useEffect(() => {
    // Load cached QR
    try {
      const stored = localStorage.getItem(qrKey);
      if (stored) setQr(JSON.parse(stored));
    } catch {}

    // Fetch vehicle info
    if (vehicleId) {
      fetch("/api/vehicles")
        .then((r) => (r.ok ? r.json() : []))
        .then((vehicles: Vehicle[]) => {
          const v = vehicles.find((v) => v.id === vehicleId) ?? null;
          setVehicle(v);
        })
        .catch(() => {});
    } else {
      // Fall back to legacy localStorage (single-vehicle flow)
      try {
        const v = localStorage.getItem("qrcar_vehicle");
        if (v) setVehicle(JSON.parse(v));
      } catch {}
    }
  }, [vehicleId, qrKey]);

  function persist(next: QrState) {
    setQr(next);
    localStorage.setItem(qrKey, JSON.stringify(next));
  }

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const id = vehicleId || vehicle?.id;
      if (!id) throw new Error("No vehicle selected");
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: id }),
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

  const backHref = vehicleId ? "/dashboard/vehicles" : "/dashboard";

  return (
    <main className="min-h-screen max-w-sm mx-auto px-6 py-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500"
      >
        <ArrowLeft size={16} /> {vehicleId ? "My Vehicles" : "Dashboard"}
      </Link>

      {!qr ? (
        <div className="mt-10 text-center space-y-4">
          <h1 className="text-[22px] font-semibold">Generate your sticker</h1>
          {vehicle && (
            <p className="text-sm text-gray-500">
              {vehicle.regNumber}
              {vehicle.make || vehicle.model ? ` · ${vehicle.make} ${vehicle.model}`.trim() : ""}
            </p>
          )}
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
              {vehicle.regNumber}
              {vehicle.make || vehicle.model
                ? ` · ${[vehicle.make, vehicle.model].filter(Boolean).join(" ")}`
                : ""}
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
