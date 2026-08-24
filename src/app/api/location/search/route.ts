import { NextRequest, NextResponse } from "next/server";
import { GeocodingService } from "@/services/geocoding-service";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  const items = await GeocodingService.search(query);
  return NextResponse.json(items);
}
