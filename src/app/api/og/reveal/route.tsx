import { supabase } from "@/utils/supabase";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username1 = searchParams.get("username1");
    const username2 = searchParams.get("username2");

    if (!username1 || !username2) {
      throw new Error("Both usernames are required");
    }

    // // Fetch fighter data from the database
    // const { data: fighters, error } = await supabase
    //   .from("fighters")
    //   .select("username, image")
    //   .in("username", [username1, username2]);

    // if (error) throw new Error(error.message);

    // if (!fighters || fighters.length !== 2) {
    //   throw new Error("Could not find both fighters");
    // }

    // const fighter1 = fighters.find(f => f.username === username1)!;
    // const fighter2 = fighters.find(f => f.username === username2)!;

    // Fetch matchup data from the database
    let { data: matchups, error: matchupError } = await supabase
      .from("matchups")
      .select(
        "*, fighters!matchups_fighter1_fkey(username, image), fighters!matchups_fighter2_fkey(username, image)"
      )
      .or(`fighter1.eq.${username1},fighter1.eq.${username2}`)
      .or(`fighter2.eq.${username1},fighter2.eq.${username2}`)
      .single();

    if (matchupError) throw new Error(matchupError.message);
    if (!matchups) throw new Error("Matchup not found");

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
              src={matchups.fighters.image}
              alt={matchups.fighters.username}
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
                flexDirection: "column",
              }}>
              <div>{matchups.fighters.username}</div>
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
              src={matchups.fighters.image}
              alt={matchups.fighters.username}
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
                flexDirection: "column",
              }}>
              <div>{matchups.fighters.username}</div>
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
