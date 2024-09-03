import { supabase } from "@/utils/supabase";
import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const debateId = searchParams.get("debateId");

  const { data: debate, error } = await supabase
    .from("debates")
    .select("*")
    .eq("id", debateId)
    .maybeSingle();

  if (error || !debate) {
    return new Response("Debate not found", { status: 404 });
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
