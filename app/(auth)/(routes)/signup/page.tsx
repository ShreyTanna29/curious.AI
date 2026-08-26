import { Signup } from "@/components/auth/signup";
import React, { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense>
      <Signup />
    </Suspense>
  );
}
