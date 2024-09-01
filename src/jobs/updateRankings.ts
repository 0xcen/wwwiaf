import { supabase } from "@/utils/supabase";
import { calculateMatchRank, calculateFighterRank } from "@/utils/ranking";

export async function updateRankings() {
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("*");

  if (matchesError) {
    console.error("Error fetching matches:", matchesError);
    return;
  }

  const { data: fighters, error: fightersError } = await supabase
    .from("fighters")
    .select("*");

  if (fightersError) {
    console.error("Error fetching fighters:", fightersError);
    return;
  }

  // Update match rankings
  for (const match of matches) {
    const newRank = calculateMatchRank(match);

    // If lastEngagementDate is not set, set it to the current date
    const updateData: any = { rank: newRank };
    if (!match.lastEngagementDate) {
      updateData.lastEngagementDate = new Date().toISOString();
    }

    await supabase.from("matches").update(updateData).eq("id", match.id);
  }

  // Update fighter rankings
  for (const fighter of fighters) {
    const newRank = calculateFighterRank(fighter, matches);
    await supabase
      .from("fighters")
      .update({ rank: newRank })
      .eq("id", fighter.id);
  }

  console.log("Rankings updated successfully");
}
