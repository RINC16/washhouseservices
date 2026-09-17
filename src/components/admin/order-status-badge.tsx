import { formatOrderStatus, getOrderStatusClasses } from "@/lib/orders";

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getOrderStatusClasses(status)}`}>
      {formatOrderStatus(status)}
    </span>
  );
}
