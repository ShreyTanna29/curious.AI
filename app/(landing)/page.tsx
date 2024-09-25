import { Button } from "@/components/ui/button";
import Link from "next/link";

function LandingPage() {
  return (
    <div>
      <Link href={"/sign-in"}>
        <Button>Login</Button>
      </Link>

      <Link href={"/sign-up"}>
        <Button>Signup</Button>
      </Link>
    </div>
  );
}

export default LandingPage;
