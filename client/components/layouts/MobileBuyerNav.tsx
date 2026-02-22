
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { buyerItems } from "./BuyerSidebar";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function MobileBuyerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    setOpen(false);
    router.push('/login');
  };

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
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
               <span className="font-display text-xl font-bold tracking-tight text-foreground">HOW MUCH</span>
            </Link>
         </div>

         <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="mb-6 px-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Account</h3>
            </div>
            <nav className="space-y-1">
              {buyerItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground"
                        : "text-muted hover:bg-light-panel hover:text-foreground dark:text-muted-foreground dark:hover:bg-dark-elevated dark:hover:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
         </div>
         
         <div className="p-4 border-t border-light-border dark:border-dark-border mt-auto">
             <button 
               onClick={handleSignOut}
               className="flex items-center gap-3 px-3 py-2 text-sm text-status-danger hover:bg-status-danger/10 dark:hover:bg-status-danger/20 w-full rounded-lg transition-colors font-medium"
             >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
             </button>
         </div>
      </SheetContent>
    </Sheet>
  );
}
