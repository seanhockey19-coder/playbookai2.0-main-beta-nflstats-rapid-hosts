import { NextResponse } from "next/server";
import { getSportsbookAdvantages } from "@/lib/rapidapi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "ARBITRAGE";

  try {
    const data = await getSportsbookAdvantages(type);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch sportsbook advantages", details: err.message },
      { status: 500 }
    );
  }
}
