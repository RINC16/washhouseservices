"use client";

import { LogIn, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "./brand-mark";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#contact", label: "Contact" },
  { href: "/orders", label: "My Orders" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white/95 backdrop-blur">
      <div className="page-shell flex h-17 items-center justify-between gap-5">
        <Link href="/" aria-label="WashHouse home" onClick={() => setMenuOpen(false)}>
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navigation.map((item) => {
            const active = item.href === pathname;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition hover:text-brand-blue ${
                  active ? "text-brand-blue" : "text-brand-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/book"
            className="rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-blue-dark"
          >
            Book a Collection
          </Link>
          <Link
            href="/login"
            aria-label="Sign in"
            className="grid size-11 place-items-center rounded-xl border border-brand-border text-brand-muted transition hover:border-brand-blue hover:text-brand-blue"
          >
            <UserRound size={18} />
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-brand-border text-brand-deep lg:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-brand-border bg-white lg:hidden">
          <nav className="page-shell flex flex-col py-4" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-slate-100 px-2 py-3 text-sm font-semibold text-brand-deep last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="mt-4 rounded-xl bg-brand-blue px-5 py-3 text-center text-sm font-bold text-white"
            >
              Book a Collection
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border px-5 py-3 text-sm font-semibold text-brand-deep"
            >
              <LogIn size={17} /> Sign in
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
