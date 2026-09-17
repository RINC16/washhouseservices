import type { Metadata } from "next";
import { Banknote, CalendarClock, PackageCheck, PackageOpen, Shirt, Truck } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { requireAdmin } from "@/lib/admin";
import { formatBookingDate, formatMoney } from "@/lib/orders";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const { supabase, profile } = await requireAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: orderData }, { count: customerCount }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, reference, status, total, collection_date, delivery_date, created_at, customer:profiles!orders_user_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
  ]);

  const orders = orderData ?? [];
  const activeStatuses = ["collection_scheduled", "collected", "washing", "drying", "ironing", "ready_for_delivery", "out_for_delivery"];
  const newOrders = orders.filter((order) => order.status === "order_placed").length;
  const activeOrders = orders.filter((order) => activeStatuses.includes(order.status)).length;
  const todayCollections = orders.filter((order) => order.collection_date === today && !["cancelled", "delivered"].includes(order.status)).length;
  const deliveredRevenue = orders.filter((order) => order.status === "delivered").reduce((total, order) => total + Number(order.total), 0);
  const firstName = profile.full_name?.split(" ")[0] || "there";

  const stats = [
    { label: "New orders", value: newOrders, detail: "Awaiting scheduling", icon: PackageOpen, accent: "bg-amber-50 text-amber-700" },
    { label: "In progress", value: activeOrders, detail: "Across the workflow", icon: Shirt, accent: "bg-blue-50 text-blue-700" },
    { label: "Today's collections", value: todayCollections, detail: formatBookingDate(today), icon: Truck, accent: "bg-violet-50 text-violet-700" },
    { label: "Delivered revenue", value: formatMoney(deliveredRevenue), detail: `${customerCount ?? 0} customer accounts`, icon: Banknote, accent: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Admin overview</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-brand-deep">Good day, {firstName}</h1>
          <p className="mt-2 text-sm text-brand-muted">Here is what is happening across WashHouse Services.</p>
        </div>
        <Link href="/admin/orders" className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-blue-dark">
          <PackageCheck size={17} /> Manage all orders
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`grid size-10 place-items-center rounded-xl ${stat.accent}`}><stat.icon size={19} /></div>
            <strong className="mt-5 block text-2xl text-brand-deep">{stat.value}</strong>
            <p className="mt-1 text-sm font-bold text-brand-deep">{stat.label}</p>
            <p className="mt-1 text-xs text-brand-muted">{stat.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-extrabold text-brand-deep">Recent orders</h2>
            <p className="mt-1 text-xs text-brand-muted">The latest customer bookings</p>
          </div>
          <Link href="/admin/orders" className="text-sm font-bold text-brand-blue">View all</Link>
        </div>

        {orders.length ? (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 7).map((order) => {
              const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer;
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[1.1fr_1fr_1fr_auto] sm:items-center sm:px-6">
                  <div><strong className="text-sm text-brand-deep">{order.reference}</strong><p className="mt-1 text-xs text-brand-muted">{customer?.full_name || "Customer"}</p></div>
                  <div className="flex items-center gap-2 text-xs text-brand-muted"><CalendarClock size={14} /> {formatBookingDate(order.collection_date)}</div>
                  <OrderStatusBadge status={order.status} />
                  <strong className="text-sm text-brand-deep">{formatMoney(order.total)}</strong>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="px-6 py-12 text-center text-sm text-brand-muted">No customer orders have been placed yet.</p>
        )}
      </div>
    </section>
  );
}
