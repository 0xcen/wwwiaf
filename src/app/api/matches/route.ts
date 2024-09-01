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
  // Fetch matches with fighter details and ranks
  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      fighter1:fighters!fighter1_id(id, username, rank),
      fighter2:fighters!fighter2_id(id, username, rank)
    `
    )
    .order("rank", { ascending: false }) // Order by match rank first
    .limit(50); // Fetch more than we need for diversity

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate a score for each match based on match rank and fighter ranks
  const scoredMatches = matches.map(match => ({
    ...match,
    score: calculateMatchScore(match),
  }));

  // Sort matches by score and select top 10
  const selectedMatches = scoredMatches
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return NextResponse.json(selectedMatches);
}

// Helper function to calculate a score for a match
function calculateMatchScore(match: any): number {
  const matchRank = match.rank || 0;
  const fighter1Rank = match.fighter1?.rank || 0;
  const fighter2Rank = match.fighter2?.rank || 0;

  // You can adjust these weights to change the importance of each factor
  const matchRankWeight = 0.5;
  const fighterRankWeight = 0.25;

  return (
    matchRank * matchRankWeight +
    (fighter1Rank + fighter2Rank) * fighterRankWeight
  );
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
