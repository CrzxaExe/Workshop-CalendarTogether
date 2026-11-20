"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Kalender", icon: CalendarDays },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#79d7fd]/20 bg-[#00183e] text-white shadow-sm shadow-black/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold text-[#79d7fd]"
          >
            <CalendarDays className="size-6" />
            <span className="hidden sm:inline">CalendarTogether</span>
          </Link>
          <nav className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#ffc54a] text-[#001736] shadow"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm leading-tight sm:block">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-white/65">{user?.email}</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-[#00bbfa] text-sm font-bold text-[#001736]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-[#ffc54a]"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}