import { Match } from "@/types/schema";
import { supabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

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
    .order("rank", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate a score for each match
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

function calculateMatchScore(match: any): number {
  const matchRank = match.rank || 0;
  const fighter1Rank = match.fighter1?.rank || 0;
  const fighter2Rank = match.fighter2?.rank || 0;

  const matchRankWeight = 0.5;
  const fighterRankWeight = 0.25;

  return (
    matchRank * matchRankWeight +
    (fighter1Rank + fighter2Rank) * fighterRankWeight
  );
}
