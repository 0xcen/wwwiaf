import { Fighter, Match } from "@/types/schema";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getFighters(
  fighter1Id: string | null,
  fighter2Id: string | null
): Promise<{ fighter1: Fighter; fighter2: Fighter; match: Match }> {
  if (!fighter1Id || !fighter2Id) {
    throw new Error("Both fighter IDs are required");
  }

  // Fetch fighters from Supabase
  const { data: fighters, error } = await supabase
    .from("fighters")
    .select("*")
    .in("id", [fighter1Id, fighter2Id]);

  if (error) {
    console.error("Error fetching fighters:", error);
    throw new Error("Failed to fetch fighters");
  }

  if (!fighters || fighters.length !== 2) {
    throw new Error("Could not find both fighters");
  }

  const fighter1 = fighters.find(f => f.id === fighter1Id);
  const fighter2 = fighters.find(f => f.id === fighter2Id);

  if (!fighter1 || !fighter2) {
    throw new Error("Could not match both fighter IDs");
  }

  // Create or fetch a match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert([{ fighter1_id: fighter1Id, fighter2_id: fighter2Id }])
    .select()
    .single();

  if (matchError) {
    console.error("Error creating match:", matchError);
    throw new Error("Failed to create match");
  }

  return {
    fighter1,
    fighter2,
    match,
  };
}
