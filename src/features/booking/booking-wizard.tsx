"use client";

import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  Shirt,
  Sparkles,
  Trash2,
  Truck,
  WashingMachine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { formatPrice, getUnitLabel, laundryServices } from "@/data/services";
import { createClient } from "@/lib/supabase/client";

export type BookingDate = {
  iso: string;
  weekday: string;
  day: string;
  month: string;
};

const serviceIcons = {
  bed: BedDouble,
  shirt: Shirt,
  sparkles: Sparkles,
  truck: Truck,
  washing: WashingMachine,
};

const bookingSteps = ["Services", "Collection", "Delivery", "Review"];

const timeSlots = [
  { label: "08:00–10:00", start: "08:00", end: "10:00" },
  { label: "10:00–12:00", start: "10:00", end: "12:00" },
  { label: "14:00–16:00", start: "14:00", end: "16:00" },
  { label: "16:00–18:00", start: "16:00", end: "18:00" },
];

type AddressForm = {
  label: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  instructions: string;
};

const initialAddress: AddressForm = {
  label: "Home",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  instructions: "",
};

function QuantityControl({
  quantity,
  setQuantity,
}: {
  quantity: number;
  setQuantity: (quantity: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-brand-border bg-white">
      <button
        type="button"
        className="grid size-9 place-items-center text-brand-muted disabled:opacity-30"
        aria-label="Decrease quantity"
        disabled={quantity <= 1}
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
      >
        <Minus size={14} />
      </button>
      <span className="min-w-10 text-center text-sm font-bold text-brand-deep">{quantity}</span>
      <button
        type="button"
        className="grid size-9 place-items-center text-brand-muted"
        aria-label="Increase quantity"
        onClick={() => setQuantity(quantity + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function BookingWizard({ dates }: { dates: BookingDate[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});
  const [collectionDate, setCollectionDate] = useState("");
  const [collectionSlot, setCollectionSlot] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [address, setAddress] = useState(initialAddress);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedItems = useMemo(
    () =>
      laundryServices
        .filter((service) => selectedServices[service.id])
        .map((service) => ({ ...service, quantity: selectedServices[service.id] })),
    [selectedServices],
  );

  const estimatedTotal = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const deliveryDates = collectionDate
    ? dates.filter((date) => date.iso > collectionDate)
    : dates.slice(1);

  const canContinue =
    (step === 1 && selectedItems.length > 0) ||
    (step === 2 && Boolean(collectionDate && collectionSlot)) ||
    (step === 3 && Boolean(deliveryDate && deliverySlot));

  function toggleService(serviceId: string) {
    setSelectedServices((current) => {
      if (current[serviceId]) {
        const next = { ...current };
        delete next[serviceId];
        return next;
      }
      return { ...current, [serviceId]: 1 };
    });
  }

  function setQuantity(serviceId: string, quantity: number) {
    setSelectedServices((current) => ({ ...current, [serviceId]: quantity }));
  }

  function selectCollectionDate(date: string) {
    setCollectionDate(date);
    if (deliveryDate && deliveryDate <= date) setDeliveryDate("");
  }

  function updateAddress(field: keyof AddressForm, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.push("/login?next=/book");
        return;
      }

      const collection = timeSlots.find((slot) => slot.label === collectionSlot);
      const delivery = timeSlots.find((slot) => slot.label === deliverySlot);
      const items = selectedItems.map((item) => ({
        service_id: item.id,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.rpc("place_order", {
        p_address: {
          label: address.label,
          phone: address.phone,
          address_line_1: address.addressLine1,
          address_line_2: address.addressLine2 || null,
          city: address.city,
          postcode: address.postcode,
        },
        p_schedule: {
          collection_date: collectionDate,
          collection_start: collection?.start,
          collection_end: collection?.end,
          delivery_date: deliveryDate,
          delivery_start: delivery?.start,
          delivery_end: delivery?.end,
          special_instructions: address.instructions || null,
        },
        p_items: items,
      });

      if (error) throw error;
      const order = data as { id: string; reference: string };
      router.push(`/orders/${order.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <ol className="mx-auto mb-10 flex max-w-xl items-start justify-between" aria-label="Booking progress">
        {bookingSteps.map((label, index) => {
          const number = index + 1;
          const complete = number < step;
          const active = number === step;
          return (
            <li key={label} className="relative flex flex-1 flex-col items-center text-center last:flex-none">
              {index < bookingSteps.length - 1 ? (
                <span className={`absolute left-1/2 top-4 h-0.5 w-full ${complete ? "bg-brand-blue" : "bg-brand-border"}`} aria-hidden="true" />
              ) : null}
              <span className={`relative z-10 grid size-8 place-items-center rounded-full border text-xs font-bold ${active ? "border-brand-navy bg-brand-navy text-white ring-4 ring-blue-100" : complete ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white text-brand-muted"}`}>
                {complete ? <Check size={16} /> : number}
              </span>
              <span className={`mt-3 text-[11px] font-semibold ${active ? "text-brand-deep" : "text-brand-muted"}`}>{label}</span>
            </li>
          );
        })}
      </ol>

      <form onSubmit={placeOrder}>
        <section className="rounded-2xl border border-brand-border bg-white p-5 card-shadow sm:p-7">
          {step === 1 ? (
            <div>
              <h2 className="text-xl font-extrabold text-brand-deep">Select Your Services</h2>
              <p className="mt-1 text-sm text-brand-muted">Choose one or more services and enter the quantity or estimated weight.</p>
              <div className="mt-6 space-y-4">
                {laundryServices.map((service) => {
                  const Icon = serviceIcons[service.icon];
                  const quantity = selectedServices[service.id];
                  const selected = Boolean(quantity);
                  const fixedQuantity = service.unit === "order" || service.unit === "surcharge";
                  return (
                    <article key={service.id} className={`rounded-2xl border p-4 transition sm:p-5 ${selected ? "border-brand-blue bg-brand-blue-soft/60" : "border-brand-border"}`}>
                      <div className="flex items-start gap-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-brand-navy"><Icon size={20} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-extrabold text-brand-deep">{service.name}</h3>
                              <p className="mt-1 text-xs leading-5 text-brand-muted sm:text-sm">{service.description}</p>
                            </div>
                            <p className="shrink-0 sm:text-right"><strong className="block text-brand-deep">{formatPrice(service.price)}</strong><span className="text-[11px] text-brand-muted">{getUnitLabel(service.unit)}</span></p>
                          </div>
                          {selected ? (
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              {fixedQuantity ? <span className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-brand-deep">1</span> : <QuantityControl quantity={quantity} setQuantity={(next) => setQuantity(service.id, next)} />}
                              <span className="text-xs text-brand-muted">{service.unit === "kg" ? "kg" : "item(s)"}</span>
                              <strong className="ml-auto text-sm text-brand-deep">{formatPrice(service.price * quantity)}</strong>
                              <button type="button" onClick={() => toggleService(service.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500"><Trash2 size={14} /> Remove</button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => toggleService(service.id)} className="mt-4 rounded-lg border border-brand-border bg-white px-4 py-2 text-xs font-bold text-brand-deep transition hover:border-brand-blue hover:text-brand-blue">Add Service</button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 2 || step === 3 ? (
            <div>
              <h2 className="text-xl font-extrabold text-brand-deep">{step === 2 ? "Collection Details" : "Delivery Details"}</h2>
              <p className="mt-1 text-sm text-brand-muted">Choose when you would like us to {step === 2 ? "collect your laundry" : "deliver your fresh laundry"}.</p>
              <div className="mt-7">
                <h3 className="flex items-center gap-2 text-sm font-bold text-brand-deep"><CalendarDays size={17} className="text-brand-blue" /> Choose a date</h3>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                  {(step === 2 ? dates : deliveryDates).slice(0, 7).map((date) => {
                    const currentValue = step === 2 ? collectionDate : deliveryDate;
                    const selected = currentValue === date.iso;
                    return (
                      <button key={date.iso} type="button" onClick={() => step === 2 ? selectCollectionDate(date.iso) : setDeliveryDate(date.iso)} className={`rounded-xl border px-2 py-3 text-center transition ${selected ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white text-brand-deep hover:border-brand-blue"}`}>
                        <span className="block text-[11px]">{date.weekday}</span>
                        <strong className="mt-1 block text-base">{date.day}</strong>
                        <span className={`block text-[10px] ${selected ? "text-blue-100" : "text-brand-muted"}`}>{date.month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-sm font-bold text-brand-deep"><Clock3 size={17} className="text-brand-blue" /> Choose a time slot</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {timeSlots.map((slot) => {
                    const currentValue = step === 2 ? collectionSlot : deliverySlot;
                    const selected = currentValue === slot.label;
                    return (
                      <button key={slot.label} type="button" onClick={() => step === 2 ? setCollectionSlot(slot.label) : setDeliverySlot(slot.label)} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selected ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white text-brand-deep hover:border-brand-blue"}`}>
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="text-xl font-extrabold text-brand-deep">Review & Confirm</h2>
              <p className="mt-1 text-sm text-brand-muted">Check your order details and confirm your collection address.</p>
              <div className="mt-6 rounded-2xl border border-brand-border p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-brand-deep"><MapPin size={17} className="text-brand-blue" /> Collection Address</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-brand-deep">Label<input required value={address.label} onChange={(event) => updateAddress("label", event.target.value)} className="mt-2 w-full rounded-xl border border-brand-border px-4 py-3 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-brand-deep">Phone<input required type="tel" value={address.phone} onChange={(event) => updateAddress("phone", event.target.value)} className="mt-2 w-full rounded-xl border border-brand-border px-4 py-3 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-brand-deep sm:col-span-2">Address Line 1<input required value={address.addressLine1} onChange={(event) => updateAddress("addressLine1", event.target.value)} className="mt-2 w-full rounded-xl border border-brand-border px-4 py-3 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-brand-deep sm:col-span-2">Address Line 2 <span className="font-normal text-brand-muted">(optional)</span><input value={address.addressLine2} onChange={(event) => updateAddress("addressLine2", event.target.value)} className="mt-2 w-full rounded-xl border border-brand-border px-4 py-3 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-brand-deep">City<input required value={address.city} onChange={(event) => updateAddress("city", event.target.value)} className="mt-2 w-full rounded-xl border border-brand-border px-4 py-3 text-sm font-normal" /></label>
                  <label className="text-xs font-bold text-brand-deep">Postcode<input required value={address.postcode} onChange={(event) => updateAddress("postcode", event.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-brand-border px-4 py-3 text-sm font-normal uppercase" /></label>
                </div>
              </div>
              <label className="mt-5 block rounded-2xl border border-brand-border p-5 text-sm font-bold text-brand-deep">Special Instructions <span className="font-normal text-brand-muted">(optional)</span><textarea value={address.instructions} onChange={(event) => updateAddress("instructions", event.target.value)} rows={3} placeholder="e.g. Use the side gate, separate darks and lights..." className="mt-3 w-full resize-y rounded-xl border border-brand-border px-4 py-3 text-sm font-normal" /></label>
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <h3 className="font-extrabold text-brand-deep">Order Summary</h3>
                <div className="mt-4 space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="text-brand-muted">{item.name} × {item.quantity}</span><strong className="text-brand-deep">{formatPrice(item.price * item.quantity)}</strong></div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-brand-border pt-4 text-xs">
                  <p className="flex justify-between gap-4"><span className="text-brand-muted">Collection</span><strong>{collectionDate} · {collectionSlot}</strong></p>
                  <p className="flex justify-between gap-4"><span className="text-brand-muted">Delivery</span><strong>{deliveryDate} · {deliverySlot}</strong></p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-4"><strong className="text-brand-deep">Estimated Total</strong><strong className="text-xl text-brand-blue">{formatPrice(estimatedTotal)}</strong></div>
              </div>
              {submitError ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}
              <button disabled={submitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? <><LoaderCircle size={17} className="animate-spin" /> Placing order...</> : <><Check size={17} /> Confirm & Place Order</>}
              </button>
              <p className="mt-3 text-center text-xs text-brand-muted">You won’t be charged until your laundry is collected.</p>
            </div>
          ) : null}
        </section>

        <div className="mt-5 flex items-center justify-between">
          <button type="button" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))} className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-brand-muted disabled:opacity-30"><ArrowLeft size={16} /> Back</button>
          {step < 4 ? (
            <button type="button" disabled={!canContinue} onClick={() => setStep((current) => Math.min(4, current + 1))} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:bg-blue-200">Continue <ArrowRight size={16} /></button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
