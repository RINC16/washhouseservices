import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  MapPin,
  PackageCheck,
  Quote,
  Shirt,
  Sparkles,
  Star,
  Truck,
  WashingMachine,
} from "lucide-react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { formatPrice, getUnitLabel, laundryServices } from "@/data/services";

const serviceIcons = {
  bed: BedDouble,
  shirt: Shirt,
  sparkles: Sparkles,
  truck: Truck,
  washing: WashingMachine,
};

const steps = [
  {
    number: "01",
    title: "You Book",
    description: "Choose your services and convenient collection and delivery slots.",
    icon: CalendarCheck,
  },
  {
    number: "02",
    title: "We Collect",
    description: "A WashHouse driver collects your laundry directly from your door.",
    icon: Truck,
  },
  {
    number: "03",
    title: "We Clean",
    description: "Your items are professionally cleaned, dried, ironed and carefully folded.",
    icon: Sparkles,
  },
  {
    number: "04",
    title: "We Deliver",
    description: "Fresh laundry returns at your selected time, beautifully packaged.",
    icon: PackageCheck,
  },
];

const reviews = [
  {
    quote: "The bedding and linen service is a game changer. My duvet came back fresh, clean and perfectly packaged.",
    name: "Emma Roberts",
    city: "Bristol",
  },
  {
    quote: "Used the express service when I was in a rush and they delivered exactly when promised. Top quality.",
    name: "David Chen",
    city: "London",
  },
  {
    quote: "Absolutely brilliant service. Collected on time, beautifully folded and delivered back the next day.",
    name: "Sarah Mitchell",
    city: "Leeds",
  },
];

const faqs = [
  ["How do I book a collection?", "Select Book a Collection, choose your services, collection and delivery slots, then enter your address. The process takes under two minutes."],
  ["What areas do you cover?", "The first launch area will be confirmed before going live. Postcode eligibility will be checked during booking."],
  ["How much does it cost?", "Prices depend on the service and quantity. Your estimated total is shown before you place the order."],
  ["How long does it take?", "Most standard services take 24–48 hours. Specialist items may take longer, and express turnaround is available."],
  ["Can I track my order?", "Yes. Your dashboard shows each stage from order placed through collection, cleaning and delivery."],
  ["What if I need to cancel?", "You can cancel from the order page before collection. After collection, contact the support team."],
];

const contactCards = [
  { icon: CircleCheck, title: "Customer support", detail: "hello@washhouse.co.uk" },
  { icon: Clock3, title: "Opening hours", detail: "Mon–Sun, 8am–8pm" },
  { icon: MapPin, title: "Our location", detail: "Unit 5, Leeds, LS1 4AQ" },
];

export default function Home() {
  return (
    <AppFrame>
      <section className="relative isolate overflow-hidden bg-brand-navy text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(63,130,247,0.48),transparent_34%),linear-gradient(115deg,#091b39_10%,#173e7d_100%)]" />
        <div className="page-shell grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold text-blue-50 ring-1 ring-white/15">
              <Star size={14} className="fill-blue-300 text-blue-300" /> Rated 4.9/5 by 2,000+ happy customers
            </div>
            <h1 className="mt-7 text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Fresh Clothes,
              <br />
              Without the Hassle
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-blue-100/85 sm:text-lg">
              Book a collection in under two minutes. We collect your laundry, professionally clean it and deliver it fresh back to your door—tracked every step of the way.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-950/25 transition hover:bg-blue-400" href="/book">
                Book a Collection <ArrowRight size={17} />
              </Link>
              <Link className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/8 px-6 py-3.5 text-sm font-bold transition hover:bg-white/15" href="#pricing">
                View Services & Pricing
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs text-blue-100/80">
              {["Free collection & delivery", "Same-day express available", "Eco-friendly cleaning"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><Check size={14} /> {item}</span>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="mx-auto grid aspect-square max-w-[490px] place-items-center rounded-[3rem] border border-white/15 bg-white/8 shadow-2xl shadow-blue-950/30 backdrop-blur-sm">
              <div className="grid size-56 place-items-center rounded-full bg-brand-blue/90 shadow-[0_0_100px_rgba(96,165,250,0.45)]">
                <WashingMachine size={112} strokeWidth={1.2} />
              </div>
              <div className="absolute bottom-10 left-2 rounded-2xl bg-white px-5 py-4 text-brand-deep shadow-xl">
                <p className="text-xs font-semibold text-brand-muted">Next available collection</p>
                <p className="mt-1 font-extrabold">Tomorrow · 10:00–12:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-space bg-[#f4f7fb]">
        <div className="page-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Simple from start to finish</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-brand-deep sm:text-4xl">How WashHouse Works</h2>
            <p className="mt-4 text-brand-muted">Professional laundry care without rearranging your day.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.number} className="rounded-2xl border border-brand-border bg-white p-6 card-shadow">
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue"><step.icon size={21} /></span>
                  <span className="text-xs font-extrabold text-blue-200">{step.number}</span>
                </div>
                <h3 className="mt-6 text-lg font-extrabold text-brand-deep">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-brand-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="section-space bg-white">
        <div className="page-shell" id="pricing">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Our services</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-brand-deep sm:text-4xl">Services & Pricing</h2>
              <p className="mt-4 text-brand-muted">Transparent pricing with no hidden fees. Choose exactly what you need.</p>
            </div>
            <Link className="inline-flex w-fit items-center gap-2 rounded-xl border border-brand-border px-5 py-3 text-sm font-bold text-brand-deep transition hover:border-brand-blue hover:text-brand-blue" href="/book">
              Book your services <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {laundryServices.slice(0, 6).map((service) => {
              const Icon = serviceIcons[service.icon];
              return (
                <article key={service.id} className="rounded-2xl border border-brand-border bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
                  <div className="flex items-start justify-between gap-5">
                    <span className="grid size-11 place-items-center rounded-xl bg-slate-50 text-brand-navy"><Icon size={20} /></span>
                    <p className="text-right"><strong className="block text-lg text-brand-deep">{formatPrice(service.price)}</strong><span className="text-xs text-brand-muted">{getUnitLabel(service.unit)}</span></p>
                  </div>
                  <h3 className="mt-5 font-extrabold text-brand-deep">{service.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">{service.shortDescription}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-brand-muted"><Clock3 size={14} /> {service.turnaround}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-space bg-[#f4f7fb]">
        <div className="page-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Customer love</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-brand-deep sm:text-4xl">What Our Customers Say</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="rounded-2xl border border-brand-border bg-white p-6 card-shadow">
                <Quote className="text-blue-200" size={30} />
                <div className="mt-3 flex text-brand-blue" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={15} className="fill-current" />)}
                </div>
                <blockquote className="mt-4 text-sm leading-6 text-brand-deep">“{review.quote}”</blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-brand-border pt-5">
                  <span className="grid size-9 place-items-center rounded-full bg-brand-navy text-xs font-bold text-white">{review.name.charAt(0)}</span>
                  <p><strong className="block text-sm text-brand-deep">{review.name}</strong><span className="text-xs text-brand-muted">{review.city}</span></p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="page-shell max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Good to know</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-brand-deep sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map(([question, answer], index) => (
              <details key={question} className="group rounded-2xl border border-brand-border bg-white p-5" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-brand-deep">
                  {question}<ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" />
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-brand-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-space bg-[#f4f7fb]">
        <div className="page-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Get in touch</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-brand-deep sm:text-4xl">Contact Us</h2>
            <p className="mt-4 text-brand-muted">Have a question? Our friendly team is here to help, seven days a week.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
            {contactCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-brand-border bg-white p-6 text-center card-shadow">
                <span className="mx-auto grid size-11 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue"><card.icon size={20} /></span>
                <h3 className="mt-4 font-extrabold text-brand-deep">{card.title}</h3>
                <p className="mt-2 text-sm text-brand-muted">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppFrame>
  );
}
