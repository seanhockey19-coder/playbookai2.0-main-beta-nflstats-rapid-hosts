import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: {
      ODDS_API_KEY: !!process.env.ODDS_API_KEY,
      RAPIDAPI_KEY: !!process.env.RAPIDAPI_KEY,
    },
    hosts: {
      RAPIDAPI_ODDS_HOST: process.env.RAPIDAPI_ODDS_HOST || null,
      RAPIDAPI_NFL_HOST: process.env.RAPIDAPI_NFL_HOST || null,
      RAPIDAPI_NBA_HOST: process.env.RAPIDAPI_NBA_HOST || null,
    },
  });
}
