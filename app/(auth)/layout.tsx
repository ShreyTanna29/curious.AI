import { CrispProvider } from "@/components/extra/crisp-provider";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.2),_transparent_40%)]" />
      <CrispProvider />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
export default AuthLayout;
