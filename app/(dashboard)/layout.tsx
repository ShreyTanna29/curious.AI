import MobileSidebar from "@/components/mobile-sidebar";
import Sidebar from "@/components/sidebar";
import { getApiLimitCount } from "@/packages/api/api-limit";
import { checkSubscription } from "@/packages/features/subscription";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <Sidebar apiLimitCount={apiLimitCount!} isPro={isPro} />
      </div>
      <main className="md:pl-72 m-2">
        <MobileSidebar apiLimitCount={apiLimitCount!} isPro={isPro} />
        {children}
      </main>
    </div>
  );
};
export default DashboardLayout;
