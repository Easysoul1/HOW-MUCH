"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { href: "/search", label: "Search" },
  { href: "/price-history", label: "Price History" },
  { href: "/vendors", label: "Vendors" },
  { href: "/personal-shopper", label: "Personal Shopper" },
  { href: "/ai-shopping-list", label: "AI List" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full section-divider bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
      <div className="container flex h-14 md:h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-display-sm font-bold tracking-tight text-primary"
        >
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.slice(0, 6).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-lg px-3 py-2 text-body-sm font-medium transition-colors duration-normal hover:bg-light-panel hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="text-muted">
            <Link href="/search" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-muted" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-[3.5rem] bottom-0 z-50 bg-white md:hidden animate-in slide-in-from-top-5 duration-200 overflow-y-auto border-t border-light-border">
          <nav className="container flex flex-col gap-1 py-6 px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-body-md font-medium transition-colors",
                  pathname === link.href ? "bg-primary/5 text-primary" : "text-muted hover:bg-light-panel hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-light-border pt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
