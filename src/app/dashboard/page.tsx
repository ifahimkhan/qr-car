"use client";

import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  AlertTriangle,
  MapPin,
  Car,
} from "lucide-react";
import { TabBar } from "./tab-bar";

interface ScanEvent {
  id: string;
  actionType: "call" | "whatsapp" | "sos";
  lat: number | null;
  lng: number | null;
  scannedAt: string;
  vehicle: { regNumber: string; make: string; model: string };
}

const ACTION = {
  call: { Icon: Phone, label: "Call", color: "#000" },
  whatsapp: { Icon: MessageCircle, label: "WhatsApp", color: "#16a34a" },
  sos: { Icon: AlertTriangle, label: "SOS alert", color: "#dc2626" },
} as const;

export default function DashboardPage() {
  const [scans, setScans] = useState<ScanEvent[]>([]);
  const [ownerName, setOwnerName] = useState("");
  const [vehicle, setVehicle] = useState<{
    regNumber: string;
    make: string;
    model: string;
  } | null>(null);

  useEffect(() => {
    try {
      const o = localStorage.getItem("qrcar_owner");
      if (o) setOwnerName(JSON.parse(o).name ?? "");
      const v = localStorage.getItem("qrcar_vehicle");
      if (v) setVehicle(JSON.parse(v));
    } catch {
      // ignore malformed cache
    }
    fetch("/api/scans")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ScanEvent[]) => {
        setScans(data);
        if (data[0]) setVehicle((cur) => cur ?? data[0].vehicle);
      })
      .catch(() => {});
  }, []);

  const now = Date.now();
  const today = scans.filter(
    (s) => new Date(s.scannedAt).toDateString() === new Date().toDateString(),
  ).length;
  const week = scans.filter(
    (s) => now - new Date(s.scannedAt).getTime() < 7 * 864e5,
  ).length;

  return (
    <main className="min-h-screen max-w-sm mx-auto px-5 pt-6 pb-24">
      <h1 className="text-xl font-semibold">Hello, {ownerName || "there"}</h1>
      {vehicle && (
        <p className="text-sm text-gray-500">
          {vehicle.regNumber} · {vehicle.make} {vehicle.model}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 mt-5">
        <Stat label="Total scans" value={scans.length} />
        <Stat label="Today" value={today} />
        <Stat label="This week" value={week} />
      </div>

      <h2 className="text-sm font-semibold text-gray-700 mt-6 mb-2">
        Recent activity
      </h2>

      {scans.length === 0 ? (
        <div className="flex flex-col items-center text-center mt-16">
          <Car size={48} className="text-gray-200" />
          <p className="mt-3 font-medium">No scans yet</p>
          <p className="text-sm text-gray-500">
            Stick your QR to your car and share the road.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {scans.slice(0, 10).map((s) => (
            <ScanRow key={s.id} scan={s} now={now} />
          ))}
        </div>
      )}

      <TabBar active="home" />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-xl py-3 px-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function ScanRow({ scan, now }: { scan: ScanEvent; now: number }) {
  const { Icon, label, color } = ACTION[scan.actionType];
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50">
      <Icon size={18} style={{ color }} />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-400">{timeAgo(now, scan.scannedAt)}</p>
      </div>
      {scan.lat != null && scan.lng != null && (
        <a
          href={`https://www.google.com/maps?q=${scan.lat},${scan.lng}`}
          target="_blank"
          rel="noreferrer"
        >
          <MapPin size={14} className="text-gray-400" />
        </a>
      )}
    </div>
  );
}

function timeAgo(now: number, iso: string): string {
  const s = Math.floor((now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}
