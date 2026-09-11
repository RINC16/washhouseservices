import type { Metadata } from "next";
import { CalendarCheck, PackageCheck, Shirt, Truck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ConfigurationNotice } from "@/components/configuration-notice";
import { formatOrderStatus } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <AppFrame><section className="page-shell py-14"><ConfigurationNotice /></section></AppFrame>;
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/dashboard");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", authData.user.id).maybeSingle(),
    supabase.from("orders").select("id, reference, status, total, collection_date, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const orderList = orders ?? [];
  const activeOrders = orderList.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
  const deliveredOrders = orderList.filter((order) => order.status === "delivered").length;
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  const stats = [
    { label: "Recent orders", value: orderList.length, icon: Shirt },
    { label: "Active orders", value: activeOrders, icon: Truck },
    { label: "Delivered", value: deliveredOrders, icon: PackageCheck },
  ];

  return (
    <AppFrame>
      <section className="page-shell py-12 sm:py-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-bold text-brand-blue">Customer dashboard</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-brand-deep">Welcome back, {firstName}</h1><p className="mt-2 text-brand-muted">Manage bookings and follow every order.</p></div>
          <Link href="/book" className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white"><CalendarCheck size={17} /> Book a Collection</Link>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-brand-border bg-white p-5 card-shadow"><stat.icon className="text-brand-blue" size={20} /><strong className="mt-5 block text-3xl text-brand-deep">{stat.value}</strong><span className="mt-1 block text-sm text-brand-muted">{stat.label}</span></div>)}
        </div>
        <div className="mt-9 rounded-2xl border border-brand-border bg-white p-5 card-shadow sm:p-7">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-brand-deep">Recent Orders</h2><Link href="/orders" className="text-sm font-bold text-brand-blue">View all</Link></div>
          {orderList.length ? <div className="mt-5 divide-y divide-brand-border">{orderList.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-sm text-brand-deep">{order.reference}</strong><p className="mt-1 text-xs text-brand-muted">Collection {order.collection_date}</p></div><div className="flex items-center justify-between gap-6"><span className="rounded-full bg-brand-blue-soft px-3 py-1.5 text-xs font-bold text-brand-blue">{formatOrderStatus(order.status)}</span><strong className="text-sm text-brand-deep">£{Number(order.total).toFixed(2)}</strong></div></Link>)}</div> : <p className="mt-8 rounded-xl bg-slate-50 px-5 py-8 text-center text-sm text-brand-muted">No orders yet. Your first WashHouse booking will appear here.</p>}
        </div>
      </section>
    </AppFrame>
  );
}
