import Link from "next/link";
import { SITE } from "@/lib/constants";

const footerLinks = {
  product: [
    { href: "/search", label: "Search Prices" },
    { href: "/price-history", label: "Price History" },
    { href: "/vendors", label: "Vendor Directory" },
    { href: "/ai-shopping-list", label: "AI Shopping List" },
    { href: "/personal-shopper", label: "Personal Shopper" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/pricing", label: "Pricing" },
  ],
  developers: [
    { href: "/integrator/docs", label: "API Docs" },
    { href: "/integrator/keys", label: "API Keys" },
  ],
  legal: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-light-border bg-light-panel dark:border-dark-border dark:bg-dark-panel">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="font-display text-xl font-bold text-primary dark:text-accent">
              {SITE.name}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">{SITE.tagline}</p>
            <p className="mt-1 text-xs text-muted-foreground">{SITE.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Developers</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.developers.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-light-border pt-8 dark:border-dark-border sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
