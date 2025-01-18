import Image from "next/image";
function Loader({ className }: { className?: string }) {
  return (
    <div className={`w-10 h-10 relative animate-spin ${className} `}>
      <Image alt="Logo" fill src="/logo.png" />
    </div>

  );
}

export default Loader;
