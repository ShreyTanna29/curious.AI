import Image from "next/image";
function Loader() {
  return (
      <div className="w-10 h-10 relative animate-spin">
        <Image alt="Logo" fill src="/logo.png" />
      </div>
    
  );
}

export default Loader;
