"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/certificates/new", label: "Add Certificate", icon: PlusCircle },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/institutions", label: "Institutions", icon: Building2 },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarNav({
  pathname,
  onClose,
  onLogout,
}: {
  pathname: string;
  onClose?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-bold leading-none text-white tracking-tight">CertiTrust</p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
              Admin Portal
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
          Main Menu
        </p>
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/admin/dashboard" &&
                href !== "/admin/certificates/new" &&
                pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? "bg-white/[0.07] text-white"
                      : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-400"
                    }`}
                  />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.06] px-2 py-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-zinc-500 transition-all duration-150 hover:bg-red-500/[0.08] hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/admin/login");
      } else {
        setChecked(true);
      }
    });
  }, [isLoginPage, router]);

  // Close drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (!checked) return null;
  if (isLoginPage) return <>{children}</>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-[#0d0d0f] px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[13.5px] font-bold tracking-tight text-white">CertiTrust</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Admin
          </span>
        </div>
      </div>

      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[240px] transform bg-[#0d0d0f] transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNav
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Page content */}
      <div className="md:pl-[240px]">
        <div className="min-h-screen pt-14 md:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
