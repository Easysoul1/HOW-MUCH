
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { vendorItems } from "./VendorSidebar";
import { useState } from "react";

export function MobileVendorNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-muted hover:text-foreground dark:text-muted-foreground dark:hover:text-white">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0 bg-white dark:bg-dark-panel border-light-border dark:border-dark-border">
         <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
            <Link href="/vendor/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                V
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Vendor Portal
              </span>
            </Link>
         </div>

         <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-1">
              {vendorItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground"
                        : "text-muted hover:bg-light-panel hover:text-foreground dark:text-muted-foreground dark:hover:bg-dark-elevated dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          isActive
                            ? "bg-primary-foreground text-primary dark:bg-accent-foreground dark:text-accent"
                            : "bg-accent text-accent-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
         </div>
         
         <div className="p-4 border-t border-light-border dark:border-dark-border mt-auto">
            <div className="flex items-center gap-3 px-3 py-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-light-panel dark:bg-dark-elevated flex items-center justify-center">
                    <span className="text-xs font-bold text-muted dark:text-muted-foreground">MS</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-foreground font-medium">My Store</span>
                    <span className="text-xs text-muted-foreground">vendor@howmuch.ng</span>
                </div>
            </div>
         </div>
      </SheetContent>
    </Sheet>
  );
}
