import { NextResponse } from "next/server";
import { updateRankings } from "@/jobs/updateRankings";

export async function GET(request: Request) {
  console.log("Test cron job handler started");
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("Unauthorized cron job attempt");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("Starting updateRankings process");
    await updateRankings();
    console.log("Ranking update process completed");
    return NextResponse.json({
      success: true,
      message: "Ranking update completed",
    });
  } catch (error) {
    console.error("Error in ranking update:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete ranking update" },
      { status: 500 }
    );
  }
}
