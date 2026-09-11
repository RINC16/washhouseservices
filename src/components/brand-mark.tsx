import { Truck } from "lucide-react";

type BrandMarkProps = {
  inverse?: boolean;
  longName?: boolean;
};

export function BrandMark({ inverse = false, longName = false }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid size-9 place-items-center rounded-xl ${
          inverse ? "bg-brand-blue text-white" : "bg-brand-navy text-white"
        }`}
        aria-hidden="true"
      >
        <Truck size={18} strokeWidth={2.2} />
      </span>
      <span
        className={`text-[15px] font-extrabold tracking-[-0.02em] ${
          inverse ? "text-white" : "text-brand-deep"
        }`}
      >
        {longName ? "WashHouse Services" : "WashHouse"}
      </span>
    </span>
  );
}
