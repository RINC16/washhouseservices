"use client";

import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: PackageSearch },
];

type AdminShellProps = {
  children: ReactNode;
  adminName: string;
  adminEmail: string;
};

export function AdminShell({ children, adminName, adminEmail }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-deep px-4 py-5 text-white">
      <div className="flex items-center justify-between px-2">
        <Link href="/admin" aria-label="WashHouse admin overview" onClick={() => setMenuOpen(false)}>
          <BrandMark inverse longName />
        </Link>
        <button type="button" className="grid size-10 place-items-center rounded-xl text-white/70 lg:hidden" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="mx-2 mt-7 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-blue-100">
        <ShieldCheck size={16} /> Admin workspace
      </div>

      <nav className="mt-6 space-y-1" aria-label="Admin navigation">
        {navigation.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-brand-blue text-white shadow-lg shadow-blue-950/20" : "text-blue-100/75 hover:bg-white/8 hover:text-white"}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <div className="px-3">
          <p className="truncate text-sm font-bold">{adminName}</p>
          <p className="mt-0.5 truncate text-xs text-blue-100/60">{adminEmail}</p>
        </div>
        <Link href="/" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-100/75 transition hover:bg-white/8 hover:text-white">
          <ExternalLink size={17} /> View customer site
        </Link>
        <button type="button" disabled={signingOut} onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-100/75 transition hover:bg-white/8 hover:text-white disabled:opacity-50">
          <LogOut size={17} /> {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close admin navigation" className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <aside className="relative h-full w-[min(86vw,280px)] shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:justify-end">
          <button type="button" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-brand-deep lg:hidden" aria-label="Open admin navigation" onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="text-right">
            <p className="text-sm font-bold text-brand-deep">{adminName}</p>
            <p className="text-xs text-brand-muted">Administrator</p>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
