// app/admin/dashboard/page.tsx
// Shows today's date, stats, and a table of today's bookings

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  slot: { date: string; time: string };
  service: { name: string; pricePence: number };
};

type DashboardData = {
  shop: { name: string; type: string };
  todayBookings: Booking[];
  stats: {
    todayCount: number;
    totalBookings: number;
    availableSlots: number;
  };
};

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function todayFormatted() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => {
        // Not logged in — send to login page
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCancel(bookingId: string) {
    if (!confirm("Cancel this booking?")) return;

    const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
      method: "PATCH",
    });

    if (res.ok) {
      // Remove from the list without reloading the page
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          todayBookings: prev.todayBookings.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" } : b
          ),
        };
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || "Something went wrong"}</p>
      </div>
    );
  }

  const { shop, todayBookings, stats } = data;

  return (
    <div className="max-w-4xl">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{todayFormatted()}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Bookings today"
          value={stats.todayCount}
          color="blue"
        />
        <StatCard
          label="Slots still free today"
          value={stats.availableSlots}
          color="green"
        />
        <StatCard
          label="Total bookings ever"
          value={stats.totalBookings}
          color="purple"
        />
      </div>

      {/* Today's bookings table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Today&apos;s bookings</h2>
        </div>

        {todayBookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>No bookings yet for today</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayBookings.map((booking) => (
              <div key={booking.id}
                   className="px-6 py-4 flex items-center justify-between gap-4">

                {/* Time badge */}
                <div className="w-16 text-center flex-shrink-0">
                  <span className="bg-gray-100 text-gray-700 text-sm font-semibold
                                   px-2 py-1 rounded-lg">
                    {booking.slot.time}
                  </span>
                </div>

                {/* Customer details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {booking.customerName}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {booking.customerPhone} · {booking.customerEmail}
                  </p>
                </div>

                {/* Service + price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    {booking.service.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatPrice(booking.service.pricePence)}
                  </p>
                </div>

                {/* Status / cancel */}
                <div className="flex-shrink-0">
                  {booking.status === "cancelled" ? (
                    <span className="bg-red-50 text-red-600 text-xs font-medium
                                     px-3 py-1 rounded-full border border-red-100">
                      Cancelled
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="bg-gray-50 text-gray-600 text-xs font-medium
                                 px-3 py-1 rounded-full border border-gray-200
                                 hover:bg-red-50 hover:text-red-600
                                 hover:border-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// Small reusable stat card
function StatCard({
  label, value, color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "purple";
}) {
  const colors = {
    blue:   "bg-blue-50 text-blue-700 border-blue-100",
    green:  "bg-green-50 text-green-700 border-green-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-75">{label}</p>
    </div>
  );
}