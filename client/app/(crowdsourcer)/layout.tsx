import { CrowdSourcerNavbar } from "@/components/layout/crowdsourcer-navbar";

export default function CrowdSourcerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-dark w-full text-foreground flex flex-col">
      <CrowdSourcerNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
