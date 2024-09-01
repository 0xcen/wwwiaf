import { NextResponse } from "next/server";
import { updateRankings } from "@/jobs/updateRankings";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await updateRankings();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating rankings:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
