"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full section-divider bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/85 dark:bg-dark/90 dark:supports-[backdrop-filter]:bg-dark/85">
      <div className="container flex h-14 md:h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-display text-display-sm font-bold tracking-tight text-primary dark:text-accent"
        >
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.slice(0, 6).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-lg px-3 py-2 text-body-sm font-medium transition-colors duration-normal hover:bg-light-panel hover:text-primary dark:hover:bg-dark-elevated dark:hover:text-white",
                pathname === link.href
                  ? "text-primary dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary dark:bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="text-gray-700 dark:text-gray-300">
            <Link href="/search" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="text-gray-700 dark:text-gray-300"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
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
        <div className="fixed inset-x-0 top-[3.5rem] bottom-0 z-50 bg-white dark:bg-dark-panel md:hidden animate-in slide-in-from-top-5 duration-200 overflow-y-auto border-t border-light-border dark:border-dark-border">
          <nav className="container flex flex-col gap-1 py-6 px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-body-md font-medium transition-colors",
                  pathname === link.href ? "bg-primary/5 text-primary dark:bg-accent/10 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-light-panel dark:hover:bg-dark-elevated hover:text-primary dark:hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-light-border pt-6 dark:border-dark-border">
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
