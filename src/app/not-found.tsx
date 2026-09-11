import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

export default function NotFound() {
  return (
    <AppFrame>
      <section className="page-shell grid min-h-[55vh] place-items-center py-16 text-center">
        <div><p className="text-sm font-bold text-brand-blue">404</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-brand-deep">We couldn’t find that page</h1><p className="mt-4 text-brand-muted">Return home or start a new collection booking.</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="rounded-xl border border-brand-border bg-white px-5 py-3 text-sm font-bold text-brand-deep">Go home</Link><Link href="/book" className="rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white">Book a Collection</Link></div></div>
      </section>
    </AppFrame>
  );
}
