import { Camera, Globe2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "./brand-mark";

const companyLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#contact", label: "Contact" },
  { href: "/book", label: "Book a Collection" },
];

const legalLinks = ["Privacy Policy", "Terms of Service", "Help & Support"];

export function SiteFooter() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="page-shell grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandMark inverse longName />
          <p className="mt-5 max-w-xs text-sm leading-6 text-blue-100/80">
            Fresh clothes, without the hassle. Professional laundry collection and delivery across the UK.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold">Company</h2>
          <ul className="mt-4 space-y-3 text-sm text-blue-100/80">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link className="transition hover:text-white" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold">Legal</h2>
          <ul className="mt-4 space-y-3 text-sm text-blue-100/80">
            {legalLinks.map((label) => (
              <li key={label}>
                <Link className="transition hover:text-white" href="#">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold">Get in Touch</h2>
          <ul className="mt-4 space-y-3 text-sm text-blue-100/80">
            <li className="flex items-center gap-2"><Phone size={15} /> 0800 123 4567</li>
            <li className="flex items-center gap-2"><Mail size={15} /> hello@washhouse.co.uk</li>
            <li className="flex items-center gap-2"><MapPin size={15} /> Unit 5, Leeds, LS1 4AQ</li>
          </ul>
          <div className="mt-5 flex gap-2">
            {[Globe2, Camera, MessageCircle].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label={["Website", "Photo gallery", "Social updates"][index]}
                className="grid size-9 place-items-center rounded-lg bg-white/10 text-blue-100 transition hover:bg-white/20 hover:text-white"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="page-shell flex flex-col gap-2 border-t border-white/15 py-5 text-xs text-blue-100/65 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 WashHouse Services. All rights reserved.</p>
        <p>Company No. 12345678 · VAT GB 123 4567 89</p>
      </div>
    </footer>
  );
}
