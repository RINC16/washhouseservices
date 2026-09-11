import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BookingWizard, type BookingDate } from "@/features/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Book a Collection",
  description: "Choose your laundry services and schedule a WashHouse collection and delivery.",
};

function createBookingDates(): BookingDate[] {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + index + 1);
    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((part) => [part.type, part.value]),
    );
    return {
      iso: date.toISOString().slice(0, 10),
      weekday: parts.weekday,
      day: parts.day,
      month: parts.month,
    };
  });
}

export default function BookPage() {
  return (
    <AppFrame>
      <section className="page-shell py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-9 text-center">
            <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-brand-deep sm:text-4xl">Book a Collection</h1>
            <p className="mt-2 text-sm text-brand-muted">Complete your booking in a few simple steps.</p>
          </div>
          <BookingWizard dates={createBookingDates()} />
        </div>
      </section>
    </AppFrame>
  );
}
