import MobileSidebar from "@/components/sidebar/mobile-sidebar";
import Sidebar from "@/components/sidebar/sidebar";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(NEXT_AUTH_CONFIG);

  if (!session?.user?.id) {
    redirect("/signin");
  }

  if (session.error === "GuestSessionExpired") {
    redirect("/signin?guestExpired=1");
  }

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
