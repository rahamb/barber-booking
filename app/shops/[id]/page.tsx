// app/shops/[id]/page.tsx
// Shows one shop — its services, prices, and available time slots by date

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Service = {
  id: string;
  name: string;
  pricePence: number;
  durationMin: number;
};

type Slot = {
  id: string;
  time: string;
  isBooked: boolean;
};

type Shop = {
  id: string;
  name: string;
  type: string;
  address: string;
  postcode: string;
  city: string;
  phone: string | null;
  services: Service[];
};

// Helper — formats pence to pounds: 1500 → "£15.00"
function formatPrice(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

// Helper — today's date as "YYYY-MM-DD"
function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function ShopPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [shop, setShop] = useState<Shop | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load shop details on first render
  useEffect(() => {
    fetch(`/api/shops/${id}?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); }
        else { setShop(data.shop); setSlots(data.slots); }
      })
      .catch(() => setError("Failed to load shop"))
      .finally(() => setLoading(false));
  }, [id]);

  // Reload slots when date changes
  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotsLoading(true);
    try {
      const res = await fetch(`/api/shops/${id}?date=${date}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Go to booking form with everything pre-filled
  const handleContinue = () => {
    if (!selectedService || !selectedSlot) return;
    router.push(
      `/book/${selectedSlot.id}?serviceId=${selectedService.id}&shopId=${id}`
    );
  };

  // Generate next 7 days for the date picker
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split("T")[0],
      label: i === 0 ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading shop...</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || "Shop not found"}</p>
          <Link href="/" className="text-blue-600 underline text-sm">Back to search</Link>
        </div>
      </div>
    );
  }

  const canContinue = selectedService && selectedSlot;

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Shop header */}
      <div className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-gray-400 text-sm hover:text-white mb-4 inline-block">
            ← Back to search
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center text-3xl">
              {shop.type === "barber" ? "💈" : "💅"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              <p className="text-gray-400 text-sm">{shop.address}, {shop.city} · {shop.postcode}</p>
              {shop.phone && <p className="text-gray-400 text-sm">{shop.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Step 1 — Pick a service */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            1. Choose a service
          </h2>
          <div className="grid gap-3">
            {shop.services.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(isSelected ? null : service)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-medium ${isSelected ? "text-white" : "text-gray-900"}`}>
                        {service.name}
                      </p>
                      <p className={`text-sm mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                        {service.durationMin} min
                      </p>
                    </div>
                    <p className={`font-bold text-lg ${isSelected ? "text-white" : "text-gray-900"}`}>
                      {formatPrice(service.pricePence)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — Pick a date */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            2. Choose a date
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {next7Days.map((day) => {
              const isSelected = selectedDate === day.value;
              return (
                <button
                  key={day.value}
                  onClick={() => handleDateChange(day.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3 — Pick a time slot */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            3. Choose a time
          </h2>

          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">
              No available slots for this date. Try another day.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(isSelected ? null : slot)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-900"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Summary + Continue button */}
        {canContinue && (
          <div className="bg-white border-2 border-gray-900 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Your selection</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Service</span>
                <span className="font-medium text-gray-900">{selectedService!.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(selectedDate).toLocaleDateString("en-GB", {
                    weekday: "long", day: "numeric", month: "long"
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span className="font-medium text-gray-900">{selectedSlot!.time}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Price</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(selectedService!.pricePence)}
                </span>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl
                         hover:bg-gray-700 transition-colors"
            >
              Continue to booking →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}