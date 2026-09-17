"use client";

import { ArrowRight, LoaderCircle, X } from "lucide-react";
import { useActionState } from "react";
import { formatOrderStatus } from "@/lib/orders";
import { updateOrderStatus, type UpdateOrderStatusState } from "./update-order-status";

const initialState: UpdateOrderStatusState = { success: false, message: "" };

type OrderStatusControlsProps = {
  orderId: string;
  nextStatus: string | null;
  canCancel: boolean;
};

export function OrderStatusControls({ orderId, nextStatus, canCancel }: OrderStatusControlsProps) {
  const [state, formAction, pending] = useActionState(updateOrderStatus, initialState);

  if (!nextStatus && !canCancel) {
    return <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-brand-muted">This order has reached its final status.</p>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="order_id" value={orderId} />
      <div className="flex flex-col gap-3 sm:flex-row">
        {nextStatus ? (
          <button name="status" value={nextStatus} disabled={pending} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-blue-dark disabled:opacity-60">
            {pending ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowRight size={17} />}
            Move to {formatOrderStatus(nextStatus)}
          </button>
        ) : null}
        {canCancel ? (
          <button name="status" value="cancelled" disabled={pending} onClick={(event) => { if (!window.confirm("Cancel this order? This cannot be reversed from the admin portal.")) event.preventDefault(); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60">
            <X size={17} /> Cancel order
          </button>
        ) : null}
      </div>
      {state.message ? <p role={state.success ? "status" : "alert"} className={`mt-3 rounded-xl px-4 py-3 text-sm ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{state.message}</p> : null}
    </form>
  );
}
