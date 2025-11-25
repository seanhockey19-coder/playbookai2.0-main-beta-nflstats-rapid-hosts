import { NextResponse } from "next/server";

export async function GET() {
  const present = !!process.env.ODDS_API_KEY;
  return NextResponse.json({
    ok: present,
    ODDS_API_KEY_present: present,
    note: "Set ODDS_API_KEY in Vercel env (Project Settings → Environment Variables). Re-deploy after changing.",
  });
}
