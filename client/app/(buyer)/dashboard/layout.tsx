import { BuyerSidebar } from "@/components/layouts/BuyerSidebar";
import { BuyerHeader } from "@/components/layouts/BuyerHeader";

export default function BuyerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <BuyerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <BuyerHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
             {children}
            </div>
        </main>
      </div>
    </div>
  );
}
