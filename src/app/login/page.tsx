"use client";

import { Suspense } from "react";
import { LoginPage as LoginPageComponent } from "@/components/auth/login-page";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginPageComponent />
    </Suspense>
  );
}
