import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardMobileNav } from "@/components/layout/dashboard-mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-dark text-foreground">
      <div className="flex">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
      <DashboardMobileNav />
    </div>
  );
}
