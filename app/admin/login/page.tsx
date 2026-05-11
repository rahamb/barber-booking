// app/admin/login/page.tsx
// The login form shop owners see when they visit /admin/login

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      // Success — go to dashboard
      router.push("/admin/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💈</div>
          <h1 className="text-2xl font-bold text-gray-900">Admin login</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage your shop</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl
                            px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sharpcuts.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:ring-2 focus:ring-gray-900
                           focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:ring-2 focus:ring-gray-900
                           focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl
                         hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Reminder of test credentials */}
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-600 font-medium mb-1">Test credentials</p>
          <p className="text-xs text-blue-500">Email: admin@sharpcuts.com</p>
          <p className="text-xs text-blue-500">Password: admin123</p>
        </div>

      </div>
    </main>
  );
}