import { CrispProvider } from "@/components/extra/crisp-provider";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-full w-full bg-background text-foreground">
      <CrispProvider />
      {children}
    </main>
  );
};

export default LandingLayout;
