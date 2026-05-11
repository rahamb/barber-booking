// app/admin/layout.tsx
// The sidebar shell that wraps every admin page.
// Every page inside app/admin/ automatically gets this layout.

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Today's bookings", icon: "📅" },
  { href: "/admin/bookings",  label: "All bookings",     icon: "📋" },
  { href: "/admin/slots",     label: "Manage slots",     icon: "🕐" },
  { href: "/admin/services",  label: "Services & prices", icon: "✂️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // Don't show sidebar on the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col fixed
                        top-0 left-0 h-full z-10">

        {/* Logo */}
        <div className="px-5 py-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💈</span>
            <div>
              <p className="font-bold text-sm">Admin panel</p>
              <p className="text-gray-400 text-xs">Manage your shop</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                            transition-colors ${
                              isActive
                                ? "bg-white text-gray-900 font-semibold"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="px-3 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                       text-gray-400 hover:bg-gray-800 hover:text-white
                       transition-colors disabled:opacity-50"
          >
            <span>🚪</span>
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside>

      {/* ── Main content — offset by sidebar width ── */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>

    </div>
  );
}