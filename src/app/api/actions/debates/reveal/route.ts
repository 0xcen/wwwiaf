import { ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { NextResponse } from "next/server";
import { BlinksightsClient } from "blinksights-sdk";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const blinksights = new BlinksightsClient(process.env.BLINKSIGHTS_API_KEY!);
const WWWIAF_PUBKEY = new PublicKey(
  "5FxmqtfPMwx5rUFvbVwFTWjdDpSbLudP2R9VspFiyWTQ"
);

export async function POST(request: Request) {
  const url = new URL(request.url);
  const debateId = url.searchParams.get("debateId");

  if (!debateId) {
    return new NextResponse("Debate ID is required", {
      headers: ACTIONS_CORS_HEADERS,
      status: 400,
    });
  }

  try {
    const requestBody = await request.json();
    const payer = new PublicKey(requestBody.account);

    await blinksights.trackActionV2(requestBody.account, request.url);

    const connection = new Connection(process.env.RPC_URL!);
    const transaction = new Transaction({
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      feePayer: payer,
    });

    const payload = await createPostResponse({
      fields: {
        transaction,
      },
    });

    return NextResponse.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.error("Error in POST request:", err);
    return new NextResponse("An error occurred", {
      headers: ACTIONS_CORS_HEADERS,
      status: 500,
    });
  }
}

export const OPTIONS = POST;
