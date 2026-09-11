import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ConfigurationNotice } from "@/components/configuration-notice";
import { formatBookingDate, formatOrderStatus } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  if (!isSupabaseConfigured()) return <AppFrame><section className="page-shell py-14"><ConfigurationNotice /></section></AppFrame>;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/orders");
  const { data: orders } = await supabase.from("orders").select("id, reference, status, total, collection_date, delivery_date, created_at").order("created_at", { ascending: false });

  return (
    <AppFrame>
      <section className="page-shell py-12 sm:py-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-brand-blue">Your laundry</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-brand-deep">My Orders</h1><p className="mt-2 text-brand-muted">Track current bookings and review your order history.</p></div><Link href="/book" className="w-fit rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white">Book a Collection</Link></div>
        {orders?.length ? <div className="mt-9 grid gap-4">{orders.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="rounded-2xl border border-brand-border bg-white p-5 card-shadow transition hover:border-brand-blue sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-lg text-brand-deep">{order.reference}</strong><p className="mt-2 text-sm text-brand-muted">Collection {formatBookingDate(order.collection_date)} · Delivery {formatBookingDate(order.delivery_date)}</p></div><div className="flex items-center justify-between gap-6"><span className="rounded-full bg-brand-blue-soft px-3 py-1.5 text-xs font-bold text-brand-blue">{formatOrderStatus(order.status)}</span><strong className="text-brand-deep">£{Number(order.total).toFixed(2)}</strong></div></div></Link>)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-brand-border bg-white p-10 text-center"><PackageOpen className="mx-auto text-brand-blue" size={32} /><h2 className="mt-4 text-lg font-extrabold text-brand-deep">No orders yet</h2><p className="mt-2 text-sm text-brand-muted">Once you place a booking, it will appear here.</p></div>}
      </section>
    </AppFrame>
  );
}
