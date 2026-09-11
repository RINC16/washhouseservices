"use client";

import { LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function cancelOrder() {
    if (!window.confirm("Cancel this order before collection?")) return;
    setCancelling(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("cancel_order", { p_order_id: orderId });
      if (error) throw error;
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The order could not be cancelled.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <button type="button" disabled={cancelling} onClick={cancelOrder} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60">
        {cancelling ? <LoaderCircle size={16} className="animate-spin" /> : <X size={16} />}
        {cancelling ? "Cancelling..." : "Cancel Order (before collection)"}
      </button>
      {errorMessage ? <p role="alert" className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
