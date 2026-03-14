
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { sidebarItems } from "./AdminSidebar";
import { adminProductsApi, sizeRequestsApi } from "@/lib/api";

export function MobileAdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const [products, sizeRequests] = await Promise.all([
          adminProductsApi.pending(),
          sizeRequestsApi.list("PENDING"),
        ]);
        const productCount = Array.isArray(products) ? products.length : ((products as { results?: unknown[] })?.results?.length ?? 0);
        const sizeCount = Array.isArray(sizeRequests) ? sizeRequests.length : ((sizeRequests as { results?: unknown[] })?.results?.length ?? 0);
        setPendingCount(productCount + sizeCount);
      } catch {
        setPendingCount(0);
      }
    }
    fetchPendingCount();
  }, []);

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
            <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                A
              </div>
              <span className="font-display font-medium text-lg text-gray-900">
                Admin
              </span>
            </Link>
         </div>

         <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const badge = item.badgeKey === "approvals" ? pendingCount : 0;
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
                    {badge > 0 && (
                      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
         </div>
      </SheetContent>
    </Sheet>
  );
}
