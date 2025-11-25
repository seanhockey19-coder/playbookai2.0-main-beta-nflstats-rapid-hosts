// FILE: app/(member)/layout.tsx
import React from "react";
import Sidebar from "./_components/Sidebar";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
