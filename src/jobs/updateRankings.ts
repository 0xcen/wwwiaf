import { supabase } from "@/utils/supabase";
import { calculateMatchRank, calculateFighterRank } from "@/utils/ranking";

export async function updateRankings() {
  console.log("Starting ranking update process");

  console.log("Fetching matches");
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("*");

  if (matchesError) {
    console.error("Error fetching matches:", matchesError);
    return;
  }
  console.log(`Fetched ${matches.length} matches`);

  console.log("Fetching fighters");
  const { data: fighters, error: fightersError } = await supabase
    .from("fighters")
    .select("*");

  if (fightersError) {
    console.error("Error fetching fighters:", fightersError);
    return;
  }
  console.log(`Fetched ${fighters.length} fighters`);

  // Update match rankings
  console.log("Calculating new match rankings");
  const matchUpdates = matches.map(match => {
    const newRank = calculateMatchRank(match);
    return {
      id: match.id,
      rank: newRank,
      last_engagement_date: match.last_engagement_date ?? null,
    };
  });

  // Batch update matches
  console.log("Updating match rankings in database");
  const { error: matchUpdateError } = await supabase
    .from("matches")
    .upsert(matchUpdates);

  if (matchUpdateError) {
    console.error("Error updating matches:", matchUpdateError);
  } else {
    console.log("Match rankings updated successfully");
  }

  // Update fighter rankings
  console.log("Calculating new fighter rankings");
  const fighterUpdates = fighters.map(fighter => {
    const newRank = calculateFighterRank(fighter, matches);
    return {
      ...fighter,
      rank: newRank,
    };
  });

  // Batch update fighters
  console.log("Updating fighter rankings in database");
  const { error: fighterUpdateError } = await supabase
    .from("fighters")
    .upsert(fighterUpdates);

  if (fighterUpdateError) {
    console.error("Error updating fighters:", fighterUpdateError);
  } else {
    console.log("Fighter rankings updated successfully");
  }

  console.log("Ranking update process completed");
}
