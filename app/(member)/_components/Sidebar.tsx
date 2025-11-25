// FILE: app/(member)/_components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ladder-challenge", label: "Ladder Challenge" },
  { href: "/ai-picks", label: "AI Picks" },
  { href: "/player-props", label: "Player Props" },
  { href: "/game-breakdown", label: "Game Breakdown" },
  { href: "/parlay-builder", label: "Parlay Builder" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-[240px] shrink-0 border-r border-zinc-800 bg-zinc-950/80">
      <div className="px-4 py-3 text-lg font-semibold">CoachesPlaybookAI</div>
      <nav className="px-2 pb-4 space-y-1">
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname?.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "block rounded-md px-3 py-2 text-sm",
                active ? "bg-zinc-800 text-white" : "text-zinc-300 hover:bg-zinc-900",
              ].join(" ")}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
