import MobileSidebar from "@/components/sidebar/mobile-sidebar";
import Sidebar from "@/components/sidebar/sidebar";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="z-10 hidden h-screen md:flex md:flex-col">
        <Sidebar />
      </div>
      <main className="min-h-0 w-full overflow-y-auto md:pl-22">
        <MobileSidebar />
        {children}
      </main>
    </div>
  );
};
export default DashboardLayout;
