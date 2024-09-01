import { Match } from "@/types/schema";
import { supabase } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// CREATE
export async function POST(request: Request) {
  const { fighter1_id, fighter2_id } = await request.json();

  const { data, error } = await supabase
    .from("matches")
    .insert({ fighter1_id, fighter2_id })
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data as Match[]);
}

// READ
export async function GET() {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .order("rank", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(matches);
}

// UPDATE
export async function PUT(request: Request) {
  const { id, votes_fighter1, votes_fighter2 } = await request.json();

  const { data, error } = await supabase
    .from("matches")
    .update({ votes_fighter1, votes_fighter2 })
    .eq("id", id)
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data as Match[]);
}

// DELETE
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Match deleted successfully" });
}
