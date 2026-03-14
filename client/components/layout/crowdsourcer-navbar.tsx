"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";

const navLinks = [
  { name: "Dashboard", href: "/crowdsourcer/dashboard" },
  { name: "Submit Price", href: "/crowdsourcer/dashboard/upload" },
  { name: "Switch to Buyer", href: "/dashboard" },
];

export function CrowdSourcerNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="border-b border-dark-border px-4 py-4 md:px-6 shrink-0 bg-dark-panel relative z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full relative">
        <Link href="/crowdsourcer/dashboard" className="font-display text-xl font-bold text-indigo-500">
          {SITE.name} — CrowdSourcer
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "hover:text-white transition-colors",
                  pathname === link.href ? "text-white" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <NotificationBell />
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden flex items-center gap-2">
          <NotificationBell />
          <button 
            className="p-2 text-muted-foreground hover:text-white transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-dark-panel border-b border-dark-border shadow-depth-2 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href 
                      ? "bg-indigo-500/10 text-indigo-400" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
