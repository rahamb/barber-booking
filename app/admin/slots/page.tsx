// app/admin/slots/page.tsx
// Owner picks a date, sets a time range and interval,
// clicks Generate — slots are created automatically

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  id: string;
  date: string;
  time: string;
  isBooked: boolean;
};

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function SlotsPage() {
  const router = useRouter();

  // Slots list
  const [slots, setSlots]         = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayString());

  // Generate form
  const [genDate, setGenDate]         = useState(todayString());
  const [startTime, setStartTime]     = useState("09:00");
  const [endTime, setEndTime]         = useState("17:00");
  const [interval, setInterval]       = useState("30");
  const [generating, setGenerating]   = useState(false);
  const [genMessage, setGenMessage]   = useState("");

  useEffect(() => {
    loadSlots(selectedDate);
  }, [selectedDate]);

  async function loadSlots(date: string) {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/admin/slots?date=${date}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenMessage("");
    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: genDate,
          startTime,
          endTime,
          intervalMinutes: parseInt(interval),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenMessage(data.error || "Failed to generate slots.");
      } else {
        setGenMessage(`✅ Created ${data.created} slots for ${genDate}`);
        // Reload the slot list if we are viewing the same date
        if (genDate === selectedDate) loadSlots(selectedDate);
      }
    } catch {
      setGenMessage("Connection error.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(slotId: string) {
    if (!confirm("Delete this slot?")) return;
    const res = await fetch(`/api/admin/slots/${slotId}`, { method: "DELETE" });
    if (res.ok) {
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    }
  }

  return (
    <div className="max-w-4xl">

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage slots</h1>

      {/* ── Generate slots form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Generate slots for a day</h2>
        <p className="text-sm text-gray-400 mb-5">
          Pick a date and time range — we&apos;ll create a slot every{" "}
          <strong>N minutes</strong> automatically.
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={genDate}
              onChange={(e) => setGenDate(e.target.value)}
              min={todayString()}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Interval (mins)
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-xl
                       hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
          >
            {generating ? "Generating…" : "Generate slots"}
          </button>
          {genMessage && (
            <p className={`text-sm ${
              genMessage.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}>
              {genMessage}
            </p>
          )}
        </div>
      </div>

      {/* ── View / delete slots ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
          <h2 className="font-semibold text-gray-900">Slots for</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm
                       outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {loadingSlots ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            Loading…
          </div>
        ) : slots.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">
            <p className="text-2xl mb-2">🕐</p>
            <p className="text-sm">No slots for this date. Generate some above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`rounded-xl border p-2 text-center text-sm ${
                  slot.isBooked
                    ? "bg-gray-50 border-gray-100 text-gray-400"
                    : "bg-white border-gray-200"
                }`}
              >
                <p className="font-medium">{slot.time}</p>
                <p className="text-xs mt-0.5 mb-1.5">
                  {slot.isBooked ? (
                    <span className="text-orange-500">Booked</span>
                  ) : (
                    <span className="text-green-600">Free</span>
                  )}
                </p>
                {!slot.isBooked && (
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}