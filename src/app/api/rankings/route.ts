import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { calculateMatchRank, calculateFighterRank } from "@/utils/ranking";

export async function GET() {
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("*");

  if (matchesError) {
    return NextResponse.json({ error: matchesError.message }, { status: 500 });
  }

  const { data: fighters, error: fightersError } = await supabase
    .from("fighters")
    .select("*");

  if (fightersError) {
    return NextResponse.json({ error: fightersError.message }, { status: 500 });
  }

  const updatedMatches = matches.map(match => ({
    ...match,
    rank: calculateMatchRank(match),
  }));

  const updatedFighters = fighters.map(fighter => ({
    ...fighter,
    rank: calculateFighterRank(fighter, updatedMatches),
  }));

  return NextResponse.json({
    matches: updatedMatches,
    fighters: updatedFighters,
  });
}

export async function POST(request: Request) {
  const { type, matchId, fighterId } = await request.json();

  if (type === "paywall") {
    // Increase rank for the match and involved fighters
    await updatePaywallRanking(matchId);
  } else if (type === "fighter") {
    // Decrease rank for the match
    await updateFighterRanking(matchId);
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

async function updatePaywallRanking(matchId: string) {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError) {
    console.error("Error fetching match:", matchError);
    return;
  }

  const newRank = match.rank + 1; // Increase rank by 1
  await supabase.from("matches").update({ rank: newRank }).eq("id", matchId);

  // Update fighters' ranks
  await updateFighterRank(match.fighter1_id, 0.5);
  await updateFighterRank(match.fighter2_id, 0.5);
}

async function updateFighterRanking(matchId: string) {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError) {
    console.error("Error fetching match:", matchError);
    return;
  }

  const newRank = Math.max(0, match.rank - 0.5); // Decrease rank by 0.5, but not below 0
  await supabase.from("matches").update({ rank: newRank }).eq("id", matchId);
}

async function updateFighterRank(fighterId: string, rankIncrease: number) {
  const { data: fighter, error: fighterError } = await supabase
    .from("fighters")
    .select("*")
    .eq("id", fighterId)
    .single();

  if (fighterError) {
    console.error("Error fetching fighter:", fighterError);
    return;
  }

  const newRank = fighter.rank + rankIncrease;
  await supabase.from("fighters").update({ rank: newRank }).eq("id", fighterId);
}
