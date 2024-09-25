import { UserButton } from "@clerk/nextjs";
import MobileSidebar from "./mobile-sidebar";

function Navbar() {
  return (
    <div className=" flex items-center">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        <UserButton  />
      </div>
    </div>
  );
}

export default Navbar;
