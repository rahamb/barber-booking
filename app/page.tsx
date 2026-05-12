"use client";

import { useState } from "react";
import Link from "next/link";

type Shop = {
  id: string;
  name: string;
  type: string;
  address: string;
  postcode: string;
  city: string;
  phone: string | null;
  _count: { slots: number };
};

const SHOP_TYPES: Record<string, { icon: string; colour: string }> = {
  barber:  { icon: "💈", colour: "from-slate-800 to-slate-900" },
  beauty:  { icon: "💅", colour: "from-pink-800 to-pink-900" },
  salon:   { icon: "✂️", colour: "from-purple-800 to-purple-900" },
  nails:   { icon: "💅", colour: "from-rose-800 to-rose-900" },
  spa:     { icon: "🧖", colour: "from-teal-800 to-teal-900" },
};

export default function HomePage() {
  const [search, setSearch]     = useState("");
  const [shops, setShops]       = useState<Shop[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState("");

  async function handleSearch() {
    const term = search.trim();
    if (!term) { setError("Please enter a city or postcode."); return; }

    setLoading(true);
    setError("");
    setShops([]);
    setSearched(false);

    try {
      const isPostcode = /^[A-Za-z]{1,2}\d/i.test(term);
      const url = isPostcode
        ? `/api/shops?postcode=${encodeURIComponent(term)}`
        : `/api/shops?city=${encodeURIComponent(term)}`;

      const res  = await fetch(url);
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Search failed."); }
      else { setShops(data.shops ?? []); }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden text-white py-20 px-4"
        style={{
          background: "linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 50%,#16213e 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
             style={{ background: "radial-gradient(circle,#8b5cf6,transparent)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
             style={{ background: "radial-gradient(circle,#3b82f6,transparent)", transform: "translate(-30%,30%)" }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-block bg-purple-500 bg-opacity-20 border border-purple-500
                          border-opacity-30 text-purple-300 text-xs font-medium px-4 py-1.5
                          rounded-full mb-6 tracking-wide uppercase">
            Online booking for local businesses
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Book your perfect
            <span className="block"
                  style={{ background: "linear-gradient(90deg,#8b5cf6,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              cut or treatment
            </span>
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            Find and instantly book nearby barbers and beauty parlours
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              placeholder="Enter your city or postcode..."
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 text-sm
                         outline-none focus:ring-2 focus:ring-purple-400
                         bg-white bg-opacity-95"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white
                         disabled:opacity-50 transition-all hover:opacity-90
                         active:scale-95 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#6366f1)" }}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

          {/* Stats row */}
          <div className="flex justify-center gap-8 mt-10">
            {[
              { value: "500+", label: "Bookings made" },
              { value: "20+",  label: "Local shops" },
              { value: "4.9★", label: "Average rating" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100
                                      h-28 animate-pulse" />
            ))}
          </div>
        )}

        {/* No results */}
        {searched && !loading && shops.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-700 font-medium">No shops found near &quot;{search}&quot;</p>
            <p className="text-gray-400 text-sm mt-1">
              Try a different city or postcode
            </p>
          </div>
        )}

        {/* Shop cards */}
        {!loading && shops.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              {shops.length} shop{shops.length !== 1 ? "s" : ""} near &quot;{search}&quot;
            </p>

            {shops.map((shop) => {
              const meta = SHOP_TYPES[shop.type] || SHOP_TYPES.barber;
              return (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.id}`}
                  className="block bg-white rounded-2xl border border-gray-100
                             overflow-hidden hover:shadow-lg hover:-translate-y-0.5
                             transition-all duration-200"
                >
                  {/* Coloured banner */}
                  <div className={`h-14 bg-gradient-to-r ${meta.colour} px-4
                                   flex items-end pb-2`}>
                    <span className="text-xs text-white text-opacity-70 capitalize">
                      {shop.type} · {shop.city}
                    </span>
                  </div>

                  <div className="px-4 pb-4 pt-2">
                    <div className="flex items-start gap-3">
                      {/* Icon lifted over banner */}
                      <div className="w-11 h-11 rounded-xl shadow-md flex items-center
                                      justify-center text-2xl flex-shrink-0 -mt-6 bg-white
                                      border border-gray-100">
                        {meta.icon}
                      </div>

                      <div className="flex-1 min-w-0 mt-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="font-bold text-gray-900">{shop.name}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                              📍 {shop.address}
                            </p>
                          </div>

                          {/* Availability */}
                          {shop._count.slots > 0 ? (
                            <span className="flex-shrink-0 bg-green-50 text-green-700
                                             text-xs font-medium px-2.5 py-1 rounded-full
                                             border border-green-100">
                              {shop._count.slots} free
                            </span>
                          ) : (
                            <span className="flex-shrink-0 bg-gray-50 text-gray-400
                                             text-xs font-medium px-2.5 py-1 rounded-full
                                             border border-gray-100">
                              Full
                            </span>
                          )}
                        </div>

                        {/* Fake stars — replace with real ratings later */}
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-yellow-400 text-xs">★★★★★</span>
                          <span className="text-xs text-gray-400">New listing</span>
                          {shop.phone && (
                            <span className="text-xs text-gray-300 ml-2">
                              · {shop.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Default state */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">✂️</div>
            <p className="text-gray-500 font-medium mb-1">
              Find your next appointment
            </p>
            <p className="text-gray-400 text-sm mb-10">
              Search by city or postcode to see available slots
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {["Instant booking", "No phone calls", "Free cancellation",
                "All local shops", "Mobile friendly"].map((f) => (
                <span key={f}
                      className="bg-white border border-gray-200 text-gray-500
                                 text-xs px-3 py-1.5 rounded-full">
                  ✓ {f}
                </span>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-10">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Own a barber shop or salon?
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Get your own booking page — takes 2 minutes
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-white text-sm
                           font-semibold px-6 py-3 rounded-xl transition-all
                           hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#6366f1)" }}
              >
                List your shop free →
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}