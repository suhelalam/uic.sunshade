/**
 * GET /api/buildings/search?query=<query> - Search for UIC buildings
 */

import { NextRequest, NextResponse } from "next/server";
import { searchUicBuildings } from "@/lib/uicBuildings";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { suggestions: [] },
        { status: 200 }
      );
    }

    const suggestions = searchUicBuildings(query);

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error("Error searching buildings:", error);
    return NextResponse.json(
      { error: "Failed to search buildings" },
      { status: 500 }
    );
  }
}
