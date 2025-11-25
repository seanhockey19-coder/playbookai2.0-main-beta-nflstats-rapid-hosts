import { NextResponse } from "next/server";
import { getLivescoreNews } from "@/lib/rapidapi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "soccer";

  try {
    const data = await getLivescoreNews(category);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch news", details: err.message },
      { status: 500 }
    );
  }
}
