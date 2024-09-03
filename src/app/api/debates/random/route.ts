import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET() {
  try {
    // Fetch all debates from the database
    const { data, error } = await supabase.from("debates").select("*");

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No debates available" },
        { status: 404 }
      );
    }

    // Select a random debate
    const randomDebate = data[Math.floor(Math.random() * data.length)];

    return NextResponse.json(randomDebate);
  } catch (err) {
    console.error("Error fetching random debate:", err);
    return NextResponse.json(
      { error: "Failed to fetch random debate" },
      { status: 500 }
    );
  }
}
