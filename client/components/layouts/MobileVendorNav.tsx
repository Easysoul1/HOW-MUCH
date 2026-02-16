
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
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0 bg-white border-gray-200">
         <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
            <Link href="/vendor/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold">
                V
              </div>
              <span className="font-milano font-bold text-lg text-black">
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
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
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
                            ? "bg-white text-black"
                            : "bg-black text-white"
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
         
         <div className="p-4 border-t border-[#E5E7EB] mt-auto">
            <div className="flex items-center gap-3 px-3 py-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">MS</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-black font-medium">My Store</span>
                    <span className="text-xs text-gray-500">vendor@howmuch.ng</span>
                </div>
            </div>
         </div>
      </SheetContent>
    </Sheet>
  );
}
