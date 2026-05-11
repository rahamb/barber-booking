// app/admin/bookings/page.tsx
// Shows ALL bookings with a date filter and status badges

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  createdAt: string;
  slot: { date: string; time: string };
  service: { name: string; pricePence: number };
};

function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

// Decide badge colour based on booking status
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed:  "bg-green-50  text-green-700  border-green-100",
    cancelled:  "bg-red-50    text-red-600    border-red-100",
    completed:  "bg-blue-50   text-blue-700   border-blue-100",
  };
  const style = styles[status] || "bg-gray-50 text-gray-500 border-gray-100";
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style} capitalize`}>
      {status}
    </span>
  );
}

export default function AllBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Load bookings — re-runs when filterDate changes
  useEffect(() => {
    setLoading(true);
    const query = filterDate ? `?date=${filterDate}` : "";
    fetch(`/api/admin/bookings${query}`)
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setBookings(d.bookings); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterDate, router]);

  async function handleCancel(bookingId: string) {
    if (!confirm("Cancel this booking? The slot will become available again.")) return;
    setCancelling(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" } : b
          )
        );
      }
    } finally {
      setCancelling(null);
    }
  }

  async function handleComplete(bookingId: string) {
    const res = await fetch(`/api/admin/bookings/${bookingId}/complete`, {
      method: "PATCH",
    });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "completed" } : b
        )
      );
    }
  }

  // Split bookings into groups for display
  const today     = todayString();
  const upcoming  = bookings.filter((b) => b.slot.date >= today && b.status === "confirmed");
  const past      = bookings.filter((b) => b.slot.date <  today || b.status !== "confirmed");

  return (
    <div className="max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All bookings</h1>
          <p className="text-gray-400 text-sm mt-1">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm
                       outline-none focus:ring-2 focus:ring-gray-900"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n}
                 className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        px-6 py-16 text-center text-gray-400">
          <p className="text-3xl mb-3">📭</p>
          <p className="font-medium">No bookings found</p>
          <p className="text-sm mt-1">
            {filterDate ? "Try clearing the date filter" : "Bookings will appear here once customers start booking"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Upcoming / today */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase
                             tracking-wide mb-3">
                Upcoming &amp; today ({upcoming.length})
              </h2>
              <BookingTable
                bookings={upcoming}
                onCancel={handleCancel}
                onComplete={handleComplete}
                cancelling={cancelling}
                showComplete
              />
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase
                             tracking-wide mb-3">
                Past ({past.length})
              </h2>
              <BookingTable
                bookings={past}
                onCancel={handleCancel}
                onComplete={handleComplete}
                cancelling={cancelling}
                showComplete={false}
              />
            </section>
          )}

        </div>
      )}
    </div>
  );
}

// Separate component for the booking rows — keeps the page clean
function BookingTable({
  bookings, onCancel, onComplete, cancelling, showComplete,
}: {
  bookings: Booking[];
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  cancelling: string | null;
  showComplete: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
      {bookings.map((booking) => (
        <div key={booking.id}
             className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">

          {/* Date + time */}
          <div className="flex-shrink-0 text-center min-w-[72px]">
            <p className="text-xs text-gray-400">
              {formatDate(booking.slot.date)}
            </p>
            <p className="font-bold text-gray-900 text-lg leading-tight">
              {booking.slot.time}
            </p>
          </div>

          {/* Customer */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {booking.customerName}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {booking.customerPhone}
            </p>
            <p className="text-xs text-gray-300 truncate">
              {booking.customerEmail}
            </p>
          </div>

          {/* Service */}
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-medium text-gray-900">
              {booking.service.name}
            </p>
            <p className="text-sm text-gray-400">
              {formatPrice(booking.service.pricePence)}
            </p>
          </div>

          {/* Status + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={booking.status} />

            {booking.status === "confirmed" && (
              <>
                {showComplete && (
                  <button
                    onClick={() => onComplete(booking.id)}
                    className="text-xs text-blue-500 hover:text-blue-700
                               transition-colors font-medium"
                  >
                    Done
                  </button>
                )}
                <button
                  onClick={() => onCancel(booking.id)}
                  disabled={cancelling === booking.id}
                  className="text-xs text-gray-400 hover:text-red-500
                             transition-colors disabled:opacity-50"
                >
                  {cancelling === booking.id ? "…" : "Cancel"}
                </button>
              </>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}