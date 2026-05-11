// app/confirmation/[id]/page.tsx
// Shown after a successful booking — reassures the customer it worked

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type BookingDetail = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  slot: { date: string; time: string };
  service: {
    name: string;
    pricePence: number;
    shop: { name: string; address: string; phone: string | null };
  };
};

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((data) => setBooking(data.booking))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Booking not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Success tick */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center
                          mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Booking confirmed!</h1>
          <p className="text-gray-400 text-sm mt-1">
            See you at {booking.service.shop.name}
          </p>
        </div>

        {/* Booking summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <Row label="Name" value={booking.customerName} />
          <Row label="Service" value={booking.service.name} />
          <Row
            label="Date"
            value={new Date(booking.slot.date).toLocaleDateString("en-GB", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          />
          <Row label="Time" value={booking.slot.time} />
          <Row
            label="Price"
            value={`£${(booking.service.pricePence / 100).toFixed(2)}`}
          />
          <div className="border-t pt-3 mt-3">
            <Row label="Location" value={booking.service.shop.address} />
            {booking.service.shop.phone && (
              <Row label="Phone" value={booking.service.shop.phone} />
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          Booking ref: {booking.id}
        </p>

        <Link
          href="/"
          className="block text-center text-gray-500 text-sm mt-6 hover:text-gray-900"
        >
          ← Make another booking
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}