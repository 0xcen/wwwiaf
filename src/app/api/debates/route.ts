import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    let query = supabase.from("debates").select("*");

    if (id) {
      query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching debates:", error);
    return NextResponse.json(
      { error: "Failed to fetch debates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { topic, debater1, debater2, image_url } = await request.json();

    const { data, error } = await supabase
      .from("debates")
      .insert([{ topic, debater1, debater2, image_url }])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("Error creating debate:", error);
    return NextResponse.json(
      { error: "Failed to create debate" },
      { status: 500 }
    );
  }
}
