import Sidebar from "@/components/Office/Sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-[1600px] lg:flex">
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
