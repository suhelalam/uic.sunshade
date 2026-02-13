/**
 * GET /api/buildings/verify - Verify if an address is a UIC building
 */

import { NextRequest, NextResponse } from "next/server";
import { isUicBuilding } from "@/lib/uicBuildings";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Missing address parameter" },
        { status: 400 }
      );
    }

    const isValid = isUicBuilding(address);

    return NextResponse.json({ isUicBuilding: isValid }, { status: 200 });
  } catch (error) {
    console.error("Error verifying building:", error);
    return NextResponse.json(
      { error: "Failed to verify building" },
      { status: 500 }
    );
  }
}
