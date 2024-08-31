import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Fighter } from "@/types/schema";
import { supabase } from "@/utils/supabase";

// CREATE
export async function POST(request: Request) {
  const { username, image } = await request.json();

  const { data, error } = await supabase
    .from("fighters")
    .insert({ username, image })
    .select();

  if (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data as Fighter[]);
}

// READ
export async function GET(request: Request) {
  try {
    // Fetch all fighters
    const { data: fighters, error: fightersError } = await supabase
      .from("fighters")
      .select("*");

    if (fightersError) throw fightersError;
    if (!fighters || fighters.length < 2) {
      return NextResponse.json(
        { error: "Not enough fighters in the database" },
        { status: 400 }
      );
    }

    // Randomly select two fighters
    const shuffled = fighters.sort(() => 0.5 - Math.random());
    const [fighter1, fighter2] = shuffled.slice(0, 2);

    let match;

    // Check if a match exists
    const { data: existingMatch, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .or(`fighter1_id.eq.${fighter1.id},fighter1_id.eq.${fighter2.id}`)
      .or(`fighter2_id.eq.${fighter1.id},fighter2_id.eq.${fighter2.id}`)
      .single();

    if (matchError && matchError.code !== "PGRST116") throw matchError;

    if (!existingMatch) {
      // Create a new match
      const { data: newMatch, error: createError } = await supabase
        .from("matches")
        .insert({ fighter1_id: fighter1.id, fighter2_id: fighter2.id })
        .select()
        .single();

      if (createError) throw createError;
      match = newMatch;
    } else {
      match = existingMatch;
    }

    return NextResponse.json({
      fighter1,
      fighter2,
      match,
    });
  } catch (error) {
    console.error("Error in GET /api/fighters:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(request: Request) {
  const { id, username, image } = await request.json();

  const { data, error } = await supabase
    .from("fighters")
    .update({ username, image })
    .eq("id", id)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data as Fighter[]);
}

// DELETE
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { error } = await supabase.from("fighters").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Fighter deleted successfully" });
}
