import { NextResponse } from "next/server";

const TWITTER_API_TOKEN = process.env.TWITTER_API_TOKEN;

async function getBase64(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${
    response.headers.get("content-type") || "image/jpeg"
  };base64,${base64}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json(
      { error: "Twitter handle is required" },
      { status: 400 }
    );
  }

  // Remove @ if present
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

  try {
    // Fetch user data from Twitter API v2
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=profile_image_url`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_API_TOKEN}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Twitter user data");
    }

    const userData = await userResponse.json();

    if (!userData.data) {
      throw new Error("User not found");
    }

    const { name, profile_image_url } = userData.data;

    // Convert image to base64
    const base64Image = await getBase64(profile_image_url);

    return NextResponse.json({
      username: name,
      profile_image_url: base64Image,
    });
  } catch (error) {
    console.error("Error fetching Twitter user:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter user data" },
      { status: 500 }
    );
  }
}
