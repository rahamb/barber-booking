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

export default function HomePage() {
  const [search, setSearch]   = useState("");
  const [shops, setShops]     = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]     = useState("");

  async function handleSearch() {
    const term = search.trim();

    // Guard — nothing typed
    if (!term) {
      setError("Please enter a city or postcode.");
      return;
    }

    setLoading(true);
    setError("");
    setShops([]);
    setSearched(false);

    try {
      // Decide whether it looks like a postcode (e.g. M1, SW1A) or a city name
      const looksLikePostcode = /^[A-Za-z]{1,2}\d/i.test(term);
      const url = looksLikePostcode
        ? `/api/shops?postcode=${encodeURIComponent(term)}`
        : `/api/shops?city=${encodeURIComponent(term)}`;

      console.log("Fetching:", url); // ← you will see this in browser console

      const response = await fetch(url);
      const data = await response.json();

      console.log("Response:", data); // ← you will see this in browser console

      if (!response.ok) {
        setError(data.error || "Search failed.");
      } else {
        setShops(data.shops ?? []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not connect. Is the dev server running?");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── Hero / search bar ── */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">Book a barber or salon</h1>
          <p className="text-gray-400 mb-8">
            Find and book nearby barbers and beauty parlours instantly
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              placeholder="Enter city or postcode — e.g. Manchester or M1"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm
                         outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl
                         hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors whitespace-nowrap cursor-pointer"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Inline error shown right below the search bar */}
          {error && (
            <p className="mt-3 text-red-300 text-sm">{error}</p>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-5
                                      animate-pulse h-24" />
            ))}
          </div>
        )}

        {/* No results */}
        {searched && !loading && shops.length === 0 && !error && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg font-medium">No shops found near "{search}"</p>
            <p className="text-sm mt-1">Try "Manchester" or a postcode like "M1"</p>
          </div>
        )}

        {/* Shop cards */}
        {!loading && shops.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              {shops.length} shop{shops.length !== 1 ? "s" : ""} found
            </p>

            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5
                           hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left — icon + info */}
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center
                                    justify-center text-2xl flex-shrink-0">
                      {shop.type === "barber" ? "💈" : "💅"}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{shop.name}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{shop.address}</p>
                      <p className="text-sm text-gray-400">
                        {shop.city} · {shop.postcode}
                      </p>
                      {shop.phone && (
                        <p className="text-sm text-gray-400">{shop.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Right — availability */}
                  <div className="flex-shrink-0 text-right">
                    {shop._count.slots > 0 ? (
                      <span className="inline-block bg-green-50 text-green-700 text-xs
                                       font-medium px-3 py-1 rounded-full border
                                       border-green-100">
                        {shop._count.slots} slots free
                      </span>
                    ) : (
                      <span className="inline-block bg-gray-50 text-gray-400 text-xs
                                       font-medium px-3 py-1 rounded-full border
                                       border-gray-100">
                        Fully booked
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1 capitalize">{shop.type}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

{/* Default state — before any search */}
{!searched && !loading && (
  <div className="text-center text-gray-400 py-12">
    <p className="text-5xl mb-4">✂️</p>
    <p className="text-sm">Search above to find shops near you</p>

    {/* Call to action for shop owners */}
    <div className="mt-10 pt-10 border-t border-gray-100">
      <p className="text-sm font-medium text-gray-500 mb-1">
        Are you a barber or salon owner?
      </p>
      <p className="text-xs text-gray-400 mb-4">
        Get your own booking page — free to set up
      </p>
      <Link
        href="/register"
        className="inline-block bg-gray-900 text-white text-sm font-semibold
                   px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
      >
        List your shop →
      </Link>
    </div>
  </div>
)}