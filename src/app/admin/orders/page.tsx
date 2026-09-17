import type { Metadata } from "next";
import { Filter, PackageOpen, Search } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { requireAdmin } from "@/lib/admin";
import { formatBookingDate, formatMoney, formatOrderStatus, orderStatusLabels } from "@/lib/orders";
import { getSingleRelation } from "@/lib/supabase/relations";

export const metadata: Metadata = { title: "Orders" };

type OrdersPageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const { q = "", status = "" } = await searchParams;
  const { supabase } = await requireAdmin();
  const validStatus = Object.hasOwn(orderStatusLabels, status) ? status : "";

  let query = supabase
    .from("orders")
    .select("id, reference, status, total, collection_date, delivery_date, created_at, customer:profiles!orders_user_id_fkey(full_name, email, phone), address:addresses!orders_address_id_fkey(city, postcode)")
    .order("created_at", { ascending: false })
    .limit(250);

  if (validStatus) query = query.eq("status", validStatus);
  const { data: orderData } = await query;

  const normalizedQuery = q.trim().toLowerCase();
  const orders = (orderData ?? []).filter((order) => {
    if (!normalizedQuery) return true;
    const customer = getSingleRelation(order.customer);
    const address = getSingleRelation(order.address);
    return [order.reference, customer?.full_name, customer?.email, customer?.phone, address?.city, address?.postcode]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery));
  });

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <div>
        <p className="text-sm font-bold text-brand-blue">Operations</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-brand-deep">All orders</h1>
        <p className="mt-2 text-sm text-brand-muted">Search bookings, review customer details and move work through each stage.</p>
      </div>

      <form className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px_auto]" method="get">
        <label className="relative">
          <span className="sr-only">Search orders</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" size={17} />
          <input name="q" defaultValue={q} placeholder="Reference, customer, phone or postcode" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-brand-deep" />
        </label>
        <label className="relative">
          <span className="sr-only">Filter by status</span>
          <Filter className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
          <select name="status" defaultValue={validStatus} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-brand-deep">
            <option value="">Every status</option>
            {Object.entries(orderStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="h-11 rounded-xl bg-brand-blue px-5 text-sm font-bold text-white transition hover:bg-brand-blue-dark">Apply filters</button>
      </form>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-brand-muted"><strong className="text-brand-deep">{orders.length}</strong> matching {orders.length === 1 ? "order" : "orders"}</p>
        {q || validStatus ? <Link href="/admin/orders" className="text-sm font-bold text-brand-blue">Clear filters</Link> : null}
      </div>

      {orders.length ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.05fr_1.2fr_1fr_1fr_0.65fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-brand-muted md:grid">
            <span>Order</span><span>Customer</span><span>Collection</span><span>Status</span><span className="text-right">Total</span>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const customer = getSingleRelation(order.customer);
              const address = getSingleRelation(order.address);
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-4 px-5 py-5 transition hover:bg-slate-50 md:grid-cols-[1.05fr_1.2fr_1fr_1fr_0.65fr] md:items-center md:px-6">
                  <div><strong className="text-sm text-brand-deep">{order.reference}</strong><p className="mt-1 text-xs text-brand-muted">Created {formatBookingDate(order.created_at?.slice(0, 10))}</p></div>
                  <div><p className="text-sm font-semibold text-brand-deep">{customer?.full_name || "Customer"}</p><p className="mt-1 text-xs text-brand-muted">{address?.city || "—"} · {address?.postcode || "—"}</p></div>
                  <div><p className="text-sm font-semibold text-brand-deep">{formatBookingDate(order.collection_date)}</p><p className="mt-1 text-xs text-brand-muted">Delivery {formatBookingDate(order.delivery_date)}</p></div>
                  <div><OrderStatusBadge status={order.status} /><span className="sr-only">{formatOrderStatus(order.status)}</span></div>
                  <strong className="text-sm text-brand-deep md:text-right">{formatMoney(order.total)}</strong>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <PackageOpen className="mx-auto text-brand-blue" size={34} />
          <h2 className="mt-4 font-extrabold text-brand-deep">No matching orders</h2>
          <p className="mt-2 text-sm text-brand-muted">Try clearing the filters or using a different search.</p>
        </div>
      )}
    </section>
  );
}
