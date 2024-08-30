import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// Initialize Supabase client
// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
// );

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username1 = searchParams.get("username1");
    const username2 = searchParams.get("username2");

    // Fetch fighter data from the database
    try {
      // const { data: fighters, error } = await supabase
      //   .from("fighters")
      //   .select("username, image")
      //   .in("username", [username1, username2]);
    } catch (e: any) {
      console.log(`${e.message}`);
    }
    const fighter1 = {
      username: "mockUser1",
      image:
        "https://pbs.twimg.com/profile_images/1775535430835863552/zgFeCArT_400x400.jpg",
    };
    const fighter2 = {
      username: "mockUser2",
      image:
        "https://pbs.twimg.com/profile_images/1775535430835863552/zgFeCArT_400x400.jpg",
    };

    // if (error) throw new Error(error.message);
    const numberOfSubmission = 100;

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: "black",
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 0",
          }}>
          <div
            style={{
              fontSize: "4rem",
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
              display: "flex",
            }}>
            Do you want to know who {numberOfSubmission} people chose?
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
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
