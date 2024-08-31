import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const f1 = searchParams.get("f1");
    const f2 = searchParams.get("f2");

    if (!f1 || !f2) {
      throw new Error("Both usernames are required");
    }

    // Fetch fighter data from the database
    const { data: fighters, error } = await supabase
      .from("fighters")
      .select("username, image")
      .in("username", [f1, f2]);

    if (error) throw new Error(error.message);

    if (!fighters || fighters.length !== 2) {
      throw new Error("Could not find both fighters");
    }

    const fighter1 = fighters.find(f => f.username === f1)!;
    const fighter2 = fighters.find(f => f.username === f2)!;

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
          {/* Fighter 1 */}
          <div
            style={{
              display: "flex",
              width: "50%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}>
            <img
              src={fighter1.image}
              alt={fighter1.username}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                fontSize: "48px",
                fontWeight: "bold",
                justifyContent: "center",
                alignItems: "center",
              }}>
              {fighter1.username}
            </div>
          </div>

          {/* Fighter 2 */}
          <div
            style={{
              display: "flex",
              width: "50%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}>
            <img
              src={fighter2.image}
              alt={fighter2.username}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                fontSize: "48px",
                fontWeight: "bold",
                justifyContent: "center",
                alignItems: "center",
              }}>
              {fighter2.username}
            </div>
          </div>

          {/* Central VS image */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              transform: "translateX(-50%)",
              width: "30%",
              zIndex: 20,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <img
              src={`${req.nextUrl.origin}/images/matchup.png`}
              alt='VS'
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Title overlay */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "20px",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              fontSize: "64px",
              fontWeight: "bold",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}>
            Who would win in a fight?
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 1200,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
