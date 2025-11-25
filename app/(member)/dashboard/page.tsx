// FILE: app/(member)/dashboard/page.tsx
"use client";
import React from "react";
import OddsPanel from "@/app/dashboard/components/OddsPanel";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">NFL Dashboard</h1>
      <OddsPanel />
    </div>
  );
}
