import MobileSidebar from "@/components/sidebar/mobile-sidebar";
import Sidebar from "@/components/sidebar/sidebar";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex w-full ">
      <div className="hidden h-full md:flex  md:flex-col  md:inset-y-0 z-10">
        <Sidebar />
      </div>
      <main className="md:pl-22 m-2  w-full p-2 ">
        <MobileSidebar />
        {children}
      </main>
    </div>
  );
};
export default DashboardLayout;
