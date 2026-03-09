import { CrispProvider } from "@/components/extra/crisp-provider";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full items-center justify-center">
      <CrispProvider />
      {children}
    </div>
  );
};
export default AuthLayout;
