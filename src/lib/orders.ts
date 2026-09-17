export const orderStatuses = [
  "order_placed",
  "collection_scheduled",
  "collected",
  "washing",
  "drying",
  "ironing",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderStatus = (typeof orderStatuses)[number] | "cancelled";

export const orderStatusLabels: Record<string, string> = {
  order_placed: "Order Placed",
  collection_scheduled: "Collection Scheduled",
  collected: "Collected",
  washing: "Washing",
  drying: "Drying",
  ironing: "Ironing",
  ready_for_delivery: "Ready for Delivery",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatOrderStatus(status: string) {
  return orderStatusLabels[status] ?? status.replaceAll("_", " ");
}

export function formatBookingDate(date: string | null | undefined) {
  if (!date) return "To be confirmed";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function formatTime(time: string | null | undefined) {
  return time?.slice(0, 5) ?? "—";
}

export function formatMoney(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value ?? 0));
}

export function getNextOrderStatus(status: string) {
  const currentIndex = orderStatuses.indexOf(status as (typeof orderStatuses)[number]);
  if (currentIndex < 0 || currentIndex === orderStatuses.length - 1) return null;
  return orderStatuses[currentIndex + 1];
}

export function getOrderStatusClasses(status: string) {
  if (status === "cancelled") return "bg-red-50 text-red-700 ring-red-200";
  if (status === "delivered") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (["order_placed", "collection_scheduled"].includes(status)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  return "bg-blue-50 text-blue-700 ring-blue-200";
}
