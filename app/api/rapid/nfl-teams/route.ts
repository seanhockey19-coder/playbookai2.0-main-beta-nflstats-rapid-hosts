import { NextResponse } from "next/server";
import { getNflTeamsRapid } from "@/lib/rapidapi";

export async function GET() {
  try {
    const data = await getNflTeamsRapid();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch NFL teams", details: err.message },
      { status: 500 }
    );
  }
}
