import { supabase } from "@/utils/supabase";
import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const debateId = searchParams.get("debateId");
  const vote = searchParams.get("vote");

  const { data: debate, error } = await supabase
    .from("debates")
    .select("*")
    .eq("id", debateId)
    .maybeSingle();

  if (error || !debate) {
    return new Response("Debate not found", { status: 404 });
  }

  const updateColumn = vote === "1" ? "votes_debater1" : "votes_debater2";

  const { data: updatedDebate, error: updateError } = await supabase
    .from("debates")
    .update({
      [updateColumn]: debate[updateColumn] + 1,
    })
    .eq("id", debateId)
    .select();

  if (updateError) {
    console.error("Error updating debate:", updateError);
    return new Response("Error updating debate", { status: 500 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          position: "relative",
        }}>
        <img
          src={debate.image_url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
