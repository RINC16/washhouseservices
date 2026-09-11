export type ServiceUnit = "kg" | "item" | "order" | "surcharge";

export type LaundryService = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  unit: ServiceUnit;
  turnaround: string;
  icon: "sparkles" | "shirt" | "bed" | "truck" | "washing";
};

export const laundryServices: LaundryService[] = [
  {
    id: "wash-dry-fold",
    name: "Wash, Dry and Fold",
    shortDescription: "Complete wash, professional drying and folding for all your daily wear.",
    description: "Complete wash, professional drying and folding service for all your daily wear.",
    price: 6,
    unit: "kg",
    turnaround: "24–48 hours",
    icon: "washing",
  },
  {
    id: "wash-fold",
    name: "Wash and Fold",
    shortDescription: "Your everyday laundry washed, dried and neatly folded.",
    description: "Your everyday laundry washed, dried and neatly folded. Perfect for regular clothing.",
    price: 4.5,
    unit: "kg",
    turnaround: "24–48 hours",
    icon: "washing",
  },
  {
    id: "bedding-linen",
    name: "Bedding and Linen",
    shortDescription: "Deep cleaning for duvets, sheets, pillowcases and household linens.",
    description: "Deep cleaning for duvets, sheets, pillowcases, mattress protectors and household linens.",
    price: 12,
    unit: "item",
    turnaround: "48–72 hours",
    icon: "bed",
  },
  {
    id: "ironing",
    name: "Ironing",
    shortDescription: "Expert ironing and pressing for crisp, wrinkle-free clothes.",
    description: "Expert ironing and pressing service to keep shirts, blouses and garments crisp and wrinkle-free.",
    price: 2.5,
    unit: "item",
    turnaround: "24–48 hours",
    icon: "shirt",
  },
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    shortDescription: "Premium dry cleaning for suits, dresses and delicate fabrics.",
    description: "Premium dry cleaning for suits, dresses, coats and delicate fabrics that need specialist care.",
    price: 8.5,
    unit: "item",
    turnaround: "48–72 hours",
    icon: "sparkles",
  },
  {
    id: "express-service",
    name: "Express Service",
    shortDescription: "Priority same-day or next-day turnaround when you are in a hurry.",
    description: "Priority same-day or next-day turnaround for when you need your laundry back in a hurry.",
    price: 15,
    unit: "surcharge",
    turnaround: "Priority turnaround",
    icon: "sparkles",
  },
  {
    id: "collection-delivery",
    name: "Collection and Delivery",
    shortDescription: "Door-to-door collection and delivery at your chosen times.",
    description: "Door-to-door collection and delivery service. We pick up your laundry and return it fresh to your door.",
    price: 3.5,
    unit: "order",
    turnaround: "Scheduled slots",
    icon: "truck",
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);
}

export function getUnitLabel(unit: ServiceUnit) {
  if (unit === "surcharge") return "surcharge";
  return `per ${unit}`;
}
