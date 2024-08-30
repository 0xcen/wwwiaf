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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  let query = supabase.from("fighters").select("*");
  if (id) query = query.eq("id", id);

  const { data, error } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  const ogImageUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL
  }/api/og?username=${encodeURIComponent(data[0].username)}`;
  return NextResponse.json({ ...data, ogImageUrl } as Fighter[]);
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
