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
