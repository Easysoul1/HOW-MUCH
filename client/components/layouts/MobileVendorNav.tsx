
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
        <Button variant="ghost" size="icon" className="md:hidden text-gray-500 hover:text-gray-900">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0 bg-white border-gray-200">
         <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link href="/vendor/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                V
              </div>
              <span className="font-display font-bold text-lg text-gray-900">
                Vendor Portal
              </span>
            </Link>
         </div>

         <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {vendorItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center",
                          isActive
                            ? "bg-green-700 text-white"
                            : "bg-green-600 text-white"
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
         
         <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="flex items-center gap-3 px-3 py-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-700">MS</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">My Store</span>
                    <span className="text-xs text-gray-500">vendor@howmuch.ng</span>
                </div>
            </div>
         </div>
      </SheetContent>
    </Sheet>
  );
}
