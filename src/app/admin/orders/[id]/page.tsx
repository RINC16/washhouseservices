import type { Metadata } from "next";
import { CalendarDays, Clock3, Mail, MapPin, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusControls } from "@/features/admin/order-status-controls";
import { requireAdmin } from "@/lib/admin";
import { formatBookingDate, formatMoney, formatOrderStatus, formatTime, getNextOrderStatus } from "@/lib/orders";
import { getSingleRelation } from "@/lib/supabase/relations";

export const metadata: Metadata = { title: "Order details" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: order }, { data: historyData }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, customer:profiles!orders_user_id_fkey(full_name, email, phone), address:addresses!orders_address_id_fkey(label, phone, address_line_1, address_line_2, city, postcode), order_items(*)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("order_status_history")
      .select("id, status, note, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!order) notFound();

  const customer = getSingleRelation(order.customer);
  const address = getSingleRelation(order.address);
  const nextStatus = getNextOrderStatus(order.status);
  const canCancel = ["order_placed", "collection_scheduled"].includes(order.status);
  const history = historyData ?? [];

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
      <Link href="/admin/orders" className="text-sm font-bold text-brand-muted transition hover:text-brand-blue">← Back to all orders</Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-extrabold tracking-[-0.04em] text-brand-deep">{order.reference}</h1><OrderStatusBadge status={order.status} /></div>
          <p className="mt-2 text-sm text-brand-muted">Placed {formatBookingDate(order.created_at?.slice(0, 10))}</p>
        </div>
        <strong className="text-2xl text-brand-deep">{formatMoney(order.total)}</strong>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold text-brand-deep">Update workflow</h2>
            <p className="mt-1 text-sm text-brand-muted">Orders move forward one stage at a time, keeping the customer timeline accurate.</p>
            <div className="mt-5"><OrderStatusControls orderId={order.id} nextStatus={nextStatus} canCancel={canCancel} /></div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold text-brand-deep">Services</h2>
            <div className="mt-5 divide-y divide-slate-100">
              {order.order_items?.map((item: { id: string; service_name: string; quantity: number; unit_price: number; line_total: number }) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 py-4 first:pt-0">
                  <div><p className="text-sm font-bold text-brand-deep">{item.service_name}</p><p className="mt-1 text-xs text-brand-muted">{Number(item.quantity)} × {formatMoney(item.unit_price)}</p></div>
                  <strong className="text-sm text-brand-deep">{formatMoney(item.line_total)}</strong>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4"><span className="font-bold text-brand-deep">Order total</span><strong className="text-lg text-brand-blue">{formatMoney(order.total)}</strong></div>
            {order.special_instructions ? <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-[0.08em] text-amber-800">Customer instructions</p><p className="mt-2 text-sm text-amber-900">{order.special_instructions}</p></div> : null}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-extrabold text-brand-deep">Status history</h2>
            {history.length ? (
              <ol className="mt-5 space-y-0">
                {history.map((entry, index) => (
                  <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < history.length - 1 ? <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-slate-200" /> : null}
                    <span className="relative z-10 mt-1 size-4 shrink-0 rounded-full border-4 border-white bg-brand-blue ring-1 ring-blue-200" />
                    <div><p className="text-sm font-bold text-brand-deep">{formatOrderStatus(entry.status)}</p><p className="mt-1 text-xs text-brand-muted">{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.created_at))}</p>{entry.note ? <p className="mt-2 text-sm text-brand-muted">{entry.note}</p> : null}</div>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-5 text-sm text-brand-muted">No history has been recorded yet.</p>}
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold text-brand-deep">Customer</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3"><UserRound className="mt-0.5 shrink-0 text-brand-blue" size={17} /><div><span className="block text-xs text-brand-muted">Name</span><strong>{customer?.full_name || "Customer"}</strong></div></div>
              <div className="flex gap-3"><Phone className="mt-0.5 shrink-0 text-brand-blue" size={17} /><div><span className="block text-xs text-brand-muted">Phone</span><strong>{address?.phone || customer?.phone || "Not provided"}</strong></div></div>
              <div className="flex gap-3"><Mail className="mt-0.5 shrink-0 text-brand-blue" size={17} /><div><span className="block text-xs text-brand-muted">Email</span>{customer?.email ? <a href={`mailto:${customer.email}`} className="font-semibold text-brand-deep hover:text-brand-blue">{customer.email}</a> : <span className="text-brand-muted">Not provided</span>}</div></div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold text-brand-deep">Collection address</h2>
            <div className="mt-5 flex gap-3 text-sm"><MapPin className="mt-0.5 shrink-0 text-brand-blue" size={18} /><address className="not-italic leading-6 text-brand-deep">{address?.address_line_1}<br />{address?.address_line_2 ? <>{address.address_line_2}<br /></> : null}{address?.city}<br />{address?.postcode}</address></div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-extrabold text-brand-deep">Schedule</h2>
            <div className="mt-5 space-y-5 text-sm">
              <div className="flex gap-3"><CalendarDays className="mt-0.5 shrink-0 text-brand-blue" size={18} /><div><span className="block text-xs text-brand-muted">Collection</span><strong>{formatBookingDate(order.collection_date)}</strong><span className="mt-1 flex items-center gap-1 text-xs text-brand-muted"><Clock3 size={12} /> {formatTime(order.collection_start)}–{formatTime(order.collection_end)}</span></div></div>
              <div className="flex gap-3"><CalendarDays className="mt-0.5 shrink-0 text-brand-blue" size={18} /><div><span className="block text-xs text-brand-muted">Delivery</span><strong>{formatBookingDate(order.delivery_date)}</strong><span className="mt-1 flex items-center gap-1 text-xs text-brand-muted"><Clock3 size={12} /> {formatTime(order.delivery_start)}–{formatTime(order.delivery_end)}</span></div></div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
