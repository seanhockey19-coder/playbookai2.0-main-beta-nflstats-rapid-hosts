import { NextResponse } from "next/server";

const ALLOWED = new Set([
  process.env.RAPIDAPI_NBA_HOST || "",
  process.env.RAPIDAPI_ODDS_HOST || "",
  process.env.RAPIDAPI_NFL_HOST || "",
].filter(Boolean));

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return NextResponse.json({ error: "RAPIDAPI_KEY not set" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const host = searchParams.get("host") || "";
  const path = searchParams.get("path") || "/";
  const query = searchParams.get("query") || "";

  if (!ALLOWED.has(host)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 400 });
  }

  const url = `https://${host}${path}${query ? (path.includes("?") ? "&" : "?") + query : ""}`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": host,
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}
