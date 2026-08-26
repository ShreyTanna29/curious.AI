import { SignIn } from "@/components/auth/signin";
import React, { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
