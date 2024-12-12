const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-full w-full bg-black">
      {children}
    </main>
  );
};

export default LandingLayout;
