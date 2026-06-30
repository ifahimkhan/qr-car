"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Plus, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabBar } from "../tab-bar";

interface Vehicle {
  id: string;
  regNumber: string;
  make: string;
  model: string;
  color: string;
}

type FormState = { regNumber: string; make: string; model: string; color: string };

const EMPTY_FORM: FormState = { regNumber: "", make: "", model: "", color: "" };

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Vehicle[]) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function field(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function addVehicle() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add vehicle");
      setVehicles((prev) => [...prev, data as Vehicle]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add vehicle");
    } finally {
      setSaving(false);
    }
  }

  function closeForm() {
    setShowForm(false);
    setError("");
    setForm(EMPTY_FORM);
  }

  return (
    <main className="min-h-screen max-w-sm mx-auto px-5 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">My Vehicles</h1>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-1.5 rounded-lg bg-black text-white hover:bg-gray-900 h-8 px-3 text-sm"
          >
            <Plus size={14} /> Add
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-5 bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">New vehicle</p>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg">Reg number *</Label>
            <Input
              id="reg"
              placeholder="MH12AB1234"
              value={form.regNumber}
              onChange={(e) => field("regNumber", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                placeholder="Maruti"
                value={form.make}
                onChange={(e) => field("make", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="Swift"
                value={form.model}
                onChange={(e) => field("model", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              placeholder="White"
              value={form.color}
              onChange={(e) => field("color", e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-[#dc2626]">{error}</p>}

          <Button
            onClick={addVehicle}
            disabled={saving || !form.regNumber.trim()}
            className="w-full rounded-xl bg-black text-white hover:bg-gray-900"
          >
            {saving ? "Saving…" : "Add vehicle"}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center text-center mt-20">
          <Car size={48} className="text-gray-200" />
          <p className="mt-3 font-medium">No vehicles yet</p>
          <p className="text-sm text-gray-500">Tap Add to register your first car.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}

      <TabBar active="cars" />
    </main>
  );
}

function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const subtitle = [v.make, v.model, v.color].filter(Boolean).join(" · ");
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold truncate">{v.regNumber}</p>
        <p className="text-sm text-gray-500 truncate">{subtitle || "No details added"}</p>
      </div>
      <Link
        href={`/dashboard/sticker?vehicleId=${v.id}`}
        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium bg-black text-white px-3 py-2 rounded-lg"
      >
        <QrCode size={13} /> Sticker
      </Link>
    </div>
  );
}
