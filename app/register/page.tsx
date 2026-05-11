// app/register/page.tsx
// New shop owner signup form
// After submitting they land straight on their admin dashboard

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    shopName:      "",
    shopType:      "barber",
    address:       "",
    postcode:      "",
    city:          "",
    phone:         "",
    adminEmail:    "",
    adminPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      // Registered and logged in — go straight to dashboard
      router.push("/admin/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💈</div>
          <h1 className="text-2xl font-bold text-gray-900">
            List your shop for free
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Set up your booking page in under 2 minutes
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-xl px-4 py-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Shop details section */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase
                             tracking-wide mb-3">
                Shop details
              </h2>
              <div className="space-y-3">

                <Field label="Shop name">
                  <input
                    name="shopName"
                    type="text"
                    value={form.shopName}
                    onChange={handleChange}
                    placeholder="e.g. Sharp Cuts Barber"
                    required
                    className="input"
                  />
                </Field>

                <Field label="Type of shop">
                  <select
                    name="shopType"
                    value={form.shopType}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="barber">Barber shop</option>
                    <option value="beauty">Beauty parlour</option>
                    <option value="salon">Hair salon</option>
                    <option value="nails">Nail salon</option>
                    <option value="spa">Spa</option>
                  </select>
                </Field>

                <Field label="Address">
                  <input
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="42 High Street"
                    required
                    className="input"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Postcode">
                    <input
                      name="postcode"
                      type="text"
                      value={form.postcode}
                      onChange={handleChange}
                      placeholder="M1 1AA"
                      required
                      className="input"
                    />
                  </Field>
                  <Field label="City">
                    <input
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Manchester"
                      required
                      className="input"
                    />
                  </Field>
                </div>

                <Field label="Phone number (optional)">
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0161 234 5678"
                    className="input"
                  />
                </Field>

              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Login details section */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase
                             tracking-wide mb-3">
                Your login details
              </h2>
              <div className="space-y-3">

                <Field label="Email address">
                  <input
                    name="adminEmail"
                    type="email"
                    value={form.adminEmail}
                    onChange={handleChange}
                    placeholder="you@yourshop.com"
                    required
                    className="input"
                  />
                </Field>

                <Field label="Password">
                  <input
                    name="adminPassword"
                    type="password"
                    value={form.adminPassword}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    className="input"
                  />
                </Field>

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-semibold py-3
                         rounded-xl hover:bg-gray-700 disabled:opacity-50
                         disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating your account…" : "Create my booking page →"}
            </button>

            <p className="text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Link href="/admin/login"
                    className="text-gray-600 underline hover:text-gray-900">
                Sign in
              </Link>
            </p>

          </form>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          {[
            { icon: "⚡", text: "Live in 2 minutes" },
            { icon: "📱", text: "Works on mobile" },
            { icon: "🔒", text: "Secure & private" },
          ].map(({ icon, text }) => (
            <div key={text}
                 className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-xs text-gray-500">{text}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

// Small helper to keep label + input together cleanly
function Field({
  label, children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}