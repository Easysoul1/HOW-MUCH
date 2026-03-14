import { VendorSidebar } from "@/components/layouts/VendorSidebar";
import { VendorHeader } from "@/components/layouts/VendorHeader";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <VendorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <VendorHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
