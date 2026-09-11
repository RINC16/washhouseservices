import type { Metadata } from "next";
import { CalendarDays, Check, Clock3 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ConfigurationNotice } from "@/components/configuration-notice";
import { CancelOrderButton } from "@/features/orders/cancel-order-button";
import { formatBookingDate, formatOrderStatus, formatTime, orderStatuses } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return <AppFrame><section className="page-shell py-14"><ConfigurationNotice /></section></AppFrame>;

  const { id } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?next=/orders/${id}`);

  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!order) notFound();

  const currentIndex = orderStatuses.indexOf(order.status);
  const cancelled = order.status === "cancelled";
  const canCancel = ["order_placed", "collection_scheduled"].includes(order.status);

  return (
    <AppFrame>
      <section className="page-shell py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <Link href="/orders" className="text-sm font-semibold text-brand-muted">← Back to orders</Link>
          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-brand-border bg-white p-5 card-shadow sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div><h1 className="text-xl font-extrabold text-brand-deep">{order.reference}</h1><p className="mt-1 text-xs text-brand-muted">Placed {formatBookingDate(order.created_at?.slice(0, 10))}</p></div>
            <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${cancelled ? "bg-red-50 text-red-600" : "bg-brand-blue-soft text-brand-blue"}`}>{formatOrderStatus(order.status)}</span>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-brand-border bg-white p-6 card-shadow">
              <h2 className="font-extrabold text-brand-deep">Order Progress</h2>
              <ol className="mt-6 space-y-0">
                {orderStatuses.map((status, index) => {
                  const complete = !cancelled && index <= currentIndex;
                  return (
                    <li key={status} className="relative flex min-h-12 gap-3 last:min-h-0">
                      {index < orderStatuses.length - 1 ? <span className={`absolute left-[13px] top-7 h-[calc(100%-14px)] w-px ${index < currentIndex ? "bg-brand-blue" : "bg-brand-border"}`} /> : null}
                      <span className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${complete ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white text-brand-muted"}`}>{complete ? <Check size={14} /> : index + 1}</span>
                      <span className={`pt-1 text-sm ${complete ? "font-bold text-brand-deep" : "text-brand-muted"}`}>{formatOrderStatus(status)}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-brand-border bg-white p-5 card-shadow">
                <h2 className="font-extrabold text-brand-deep">Schedule</h2>
                <div className="mt-5 space-y-5 text-sm">
                  <div className="flex gap-3"><CalendarDays className="mt-0.5 text-brand-blue" size={18} /><p><span className="block text-xs text-brand-muted">Collection</span><strong>{formatBookingDate(order.collection_date)}</strong><span className="mt-1 flex items-center gap-1 text-xs text-brand-muted"><Clock3 size={12} /> {formatTime(order.collection_start)}–{formatTime(order.collection_end)}</span></p></div>
                  <div className="flex gap-3"><CalendarDays className="mt-0.5 text-brand-blue" size={18} /><p><span className="block text-xs text-brand-muted">Delivery</span><strong>{formatBookingDate(order.delivery_date)}</strong><span className="mt-1 flex items-center gap-1 text-xs text-brand-muted"><Clock3 size={12} /> {formatTime(order.delivery_start)}–{formatTime(order.delivery_end)}</span></p></div>
                </div>
              </div>
              <div className="rounded-2xl border border-brand-border bg-white p-5 card-shadow">
                <h2 className="font-extrabold text-brand-deep">Services</h2>
                <div className="mt-4 space-y-2">{order.order_items?.map((item: { id: string; service_name: string; quantity: number; line_total: number }) => <p key={item.id} className="flex justify-between gap-4 text-sm"><span className="text-brand-muted">{item.service_name} × {item.quantity}</span><strong>£{Number(item.line_total).toFixed(2)}</strong></p>)}</div>
                <p className="mt-4 flex justify-between border-t border-brand-border pt-4"><strong>Total</strong><strong className="text-brand-blue">£{Number(order.total).toFixed(2)}</strong></p>
              </div>
            </div>
          </div>
          {canCancel ? <div className="mt-5"><CancelOrderButton orderId={order.id} /></div> : null}
        </div>
      </section>
    </AppFrame>
  );
}
