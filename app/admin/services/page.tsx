// app/admin/services/page.tsx
// Owner can add, edit prices, and delete services

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
  pricePence: number;
  durationMin: number;
};

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]     = useState(true);

  // New service form
  const [name, setName]           = useState("");
  const [price, setPrice]         = useState("");
  const [duration, setDuration]   = useState("30");
  const [adding, setAdding]       = useState(false);
  const [addError, setAddError]   = useState("");

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setServices(d.services); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    const priceNum = parseFloat(price);
    if (!name.trim() || isNaN(priceNum) || priceNum <= 0) {
      setAddError("Please enter a valid name and price.");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          pricePence: Math.round(priceNum * 100),
          durationMin: parseInt(duration),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error); return; }

      setServices((prev) => [...prev, data.service]);
      setName(""); setPrice(""); setDuration("30");
    } catch {
      setAddError("Failed to add service.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) setServices((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading…</p>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Services &amp; prices</h1>

      {/* Current services */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Current services</h2>
        </div>

        {services.length === 0 ? (
          <p className="px-6 py-8 text-gray-400 text-sm text-center">
            No services yet. Add one below.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {services.map((s) => (
              <div key={s.id}
                   className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-sm text-gray-400">{s.durationMin} min</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-gray-900">
                    £{(s.pricePence / 100).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add service form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Add a service</h2>

        {addError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl
                          px-4 py-3 text-sm mb-4">
            {addError}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Service name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Skin Fade"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Price (£)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="18.00"
                step="0.50"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={adding}
            className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl
                       hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {adding ? "Adding…" : "Add service"}
          </button>
        </form>
      </div>
    </div>
  );
}