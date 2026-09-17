"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { formatOrderStatus, orderStatusLabels } from "@/lib/orders";

export type UpdateOrderStatusState = {
  success: boolean;
  message: string;
};

export async function updateOrderStatus(
  _previousState: UpdateOrderStatusState,
  formData: FormData,
): Promise<UpdateOrderStatusState> {
  const orderId = String(formData.get("order_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)) {
    return { success: false, message: "The order identifier is invalid." };
  }
  if (!Object.hasOwn(orderStatusLabels, status)) {
    return { success: false, message: "Choose a valid order status." };
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_status: status,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);

  return { success: true, message: `Order moved to ${formatOrderStatus(status)}.` };
}
