"use client";

import dynamic from "next/dynamic";

export const AuthProvider = dynamic(
  () => import("./auth-provider").then((m) => m.AuthProvider),
  { ssr: false }
);

export const Chatbot = dynamic(
  () => import("./chatbot").then((m) => m.Chatbot),
  { ssr: false }
);
