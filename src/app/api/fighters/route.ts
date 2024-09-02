import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Fighter } from "@/types/schema";
import { supabase } from "@/utils/supabase";

// Constant for the probability of selecting a new fighter
const NEW_FIGHTER_SELECTION_PROBABILITY = 0.2;

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
    const { searchParams } = new URL(request.url);
    const fighter1Username = searchParams.get("fighter1");
    const fighter2Username = searchParams.get("fighter2");

    if (fighter1Username && fighter2Username) {
      // Fetch specific fighters by username
      const { data: fighters, error } = await supabase
        .from("fighters")
        .select("*")
        .in("username", [fighter1Username, fighter2Username]);

      if (error) throw error;
      if (!fighters || fighters.length !== 2) {
        return NextResponse.json(
          { error: "One or both fighters not found" },
          { status: 404 }
        );
      }

      const [fighter1, fighter2] = fighters;

      // Check if a match exists with these fighters in any order
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .or(
          `and(fighter1_id.eq.${fighter1.id},fighter2_id.eq.${fighter2.id}),and(fighter1_id.eq.${fighter2.id},fighter2_id.eq.${fighter1.id})`
        )
        .order("rank", { ascending: false })
        .limit(1)
        .single();

      if (matchError && matchError.code !== "PGRST116") throw matchError;

      return NextResponse.json({
        fighter1,
        fighter2,
        match: match || null,
      });
    }

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

    // Separate new fighters (rank = 0) from ranked fighters
    const newFighters = fighters.filter(f => f.rank === 0);
    const rankedFighters = fighters.filter(f => f.rank > 0);

    // Select first fighter
    const fighter1 =
      Math.random() < NEW_FIGHTER_SELECTION_PROBABILITY &&
      newFighters.length > 0
        ? selectRandomFighter(newFighters)
        : selectFighterByRank(rankedFighters);

    // Select second fighter
    const remainingFighters = fighters.filter(f => f.id !== fighter1.id);
    const fighter2 =
      Math.random() < NEW_FIGHTER_SELECTION_PROBABILITY &&
      newFighters.length > 1
        ? selectRandomFighter(remainingFighters.filter(f => f.rank === 0))
        : selectFighterByRank(remainingFighters);

    // Check if a match exists with these fighters in any order
    const { data: existingMatch, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .or(
        `and(fighter1_id.eq.${fighter1.id},fighter2_id.eq.${fighter2.id}),and(fighter1_id.eq.${fighter2.id},fighter2_id.eq.${fighter1.id})`
      )
      .order("rank", { ascending: false }) // Order by match rank
      .limit(1)
      .single();

    if (matchError && matchError.code !== "PGRST116") throw matchError;

    let match;

    if (!existingMatch) {
      // Create a new match only if no match exists
      const { data: newMatch, error: createError } = await supabase
        .from("matches")
        .insert({
          fighter1_id: fighter1.id,
          fighter2_id: fighter2.id,
          rank: 0, // Initial rank for new match
        })
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

// Helper function to select a fighter based on rank with some randomness
function selectFighterByRank(fighters: Fighter[]): Fighter {
  const totalRank = fighters.reduce((sum, fighter) => sum + fighter.rank, 0);
  let randomValue = Math.random() * totalRank;

  for (const fighter of fighters) {
    randomValue -= fighter.rank;
    if (randomValue <= 0) {
      return fighter;
    }
  }

  // Fallback to random selection if something goes wrong
  return selectRandomFighter(fighters);
}

// Helper function to select a random fighter
function selectRandomFighter(fighters: Fighter[]): Fighter {
  return fighters[Math.floor(Math.random() * fighters.length)];
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
