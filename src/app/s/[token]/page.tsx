"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Phone,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

type ActionType = "call" | "whatsapp" | "sos";

// Public scanner landing page. A stranger scans the sticker, picks an action, and
// the owner is notified server-side. The owner's phone/name never reaches this page.
export default function ScannerPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {}, // silent failure — GPS optional
    );
  }, []);

  async function logScan(actionType: ActionType) {
    await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, actionType, lat, lng }),
    });
  }

  async function handleCall() {
    setLoading(true);
    await logScan("call");
    window.location.href = `tel:${process.env.NEXT_PUBLIC_TWILIO_NUMBER}`;
  }

  async function handleWhatsApp() {
    setLoading(true);
    await logScan("whatsapp");
    setSent(true);
  }

  async function handleSOS() {
    setLoading(true);
    await logScan("sos");
    setSent(true);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center max-w-sm mx-auto px-6 w-full">
        <CheckCircle size={48} className="text-[#16a34a]" />
        <p className="mt-4 text-lg font-semibold text-center">
          Owner has been notified.
        </p>
        <p className="mt-1 text-sm text-gray-500 text-center">
          Thank you for helping.
        </p>
      </main>
    );
  }

  const btn =
    "flex items-center justify-center gap-2 rounded-xl py-4 w-full font-medium min-h-12 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center max-w-sm mx-auto px-6 w-full">
      <Car size={40} className="text-gray-400" />
      <h1 className="mt-4 text-[22px] font-semibold text-center">
        Vehicle needs attention
      </h1>
      <p className="mt-2 text-sm text-gray-500 text-center">
        The owner will be notified. Your number stays private.
      </p>

      <div className="mt-8 w-full space-y-3">
        <button
          onClick={handleCall}
          disabled={loading}
          className={`${btn} bg-black text-white`}
        >
          <Phone size={18} />
          Call owner (anonymous)
        </button>
        <button
          onClick={handleWhatsApp}
          disabled={loading}
          className={`${btn} bg-[#16a34a] text-white`}
        >
          <MessageCircle size={18} />
          Message via WhatsApp
        </button>
        <button
          onClick={handleSOS}
          disabled={loading}
          className={`${btn} bg-[#dc2626] text-white`}
        >
          <AlertTriangle size={18} />
          SOS — emergency alert
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        {lat !== undefined && lng !== undefined
          ? "Location captured"
          : "Enable location for better alerts"}
      </p>
    </main>
  );
}
