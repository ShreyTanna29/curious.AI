import Image from "next/image";

function Loader({ className }: { className?: string }) {
  return (
    <div className={`relative w-16 h-16 ${className}`}>
      <div className="w-10 h-10 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-full">
        <Image alt="Logo" fill src="/logo.png" className="rounded-full" />
      </div>

     <div className={`flex items-center justify-center gap-1 ${className}`}>
      <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:0s]" />
      <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
      <span className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
    </div>
  );
}

export default Loader;
