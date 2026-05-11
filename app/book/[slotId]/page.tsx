// app/book/[slotId]/page.tsx
// The final step — customer enters their name, email, phone and confirms

"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function BookingPage() {
  const { slotId } = useParams<{ slotId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const serviceId = searchParams.get("serviceId") || "";
  const shopId = searchParams.get("shopId") || "";

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple client-side check
    if (!form.customerName.trim() || !form.customerEmail.trim() || !form.customerPhone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, serviceId, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Booking failed.");
        return;
      }

      // Success — go to confirmation page
      router.push(`/confirmation/${data.booking.id}`);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back link */}
        <button
          onClick={() => router.push(`/shops/${shopId}`)}
          className="text-gray-400 text-sm hover:text-gray-600 mb-6 inline-block"
        >
          ← Back to shop
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Your details</h1>
          <p className="text-gray-400 text-sm mb-6">
            Almost done — just confirm who this booking is for.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl
                            px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                name="customerName"
                type="text"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                name="customerEmail"
                type="email"
                value={form.customerEmail}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile number
              </label>
              <input
                name="customerPhone"
                type="tel"
                value={form.customerPhone}
                onChange={handleChange}
                placeholder="07700 900000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl
                         hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors mt-2"
            >
              {submitting ? "Confirming..." : "Confirm booking"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}