import { supabase } from "@/utils/supabase";
import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { NextResponse } from "next/server";
import { BlinksightsClient } from "blinksights-sdk";

const WWWIAF_PUBKEY = new PublicKey(
  "5FxmqtfPMwx5rUFvbVwFTWjdDpSbLudP2R9VspFiyWTQ"
);

const blinksights = new BlinksightsClient(process.env.BLINKSIGHTS_API_KEY!);

export async function GET(req: Request, res: Response) {
  try {
    // this whole block doesn't matter because in action chaining it gets added in the previous action
    const actionGetResp: ActionGetResponse = {
      icon: "", // create OG image
      type: "action",
      title: ``,
      description: "",
      label: "",
    };

    return NextResponse.json(actionGetResp, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    let message = "An unknown error occurred";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }
    return new NextResponse(message, {
      headers: ACTIONS_CORS_HEADERS,
      status: 500,
    });
  }
}

export const OPTIONS = GET;

export const POST = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const matchId = url.searchParams.get("matchId");
    const f1 = url.searchParams.get("f1");
    const f2 = url.searchParams.get("f2");
    const vote = url.searchParams.get("vote");

    if (!vote || !matchId) {
      throw new Error("Vote and matchId are required");
    }

    const match = await fetch(`/api/matches?id=${matchId}`);
    const matchData = await match.json();
    const requestBody = await request.json();
    const payer = new PublicKey(requestBody.account);

    try {
      await blinksights.trackActionV2(requestBody.account, request.url);
    } catch (err) {
      console.log(err);
    }

    const connection = new Connection(process.env.RPC_URL!);

    // Create Simple Transaction
    const transaction = new Transaction({
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      feePayer: payer,
    });

    const blinksightsActionIdentityInstruction =
      await blinksights.getActionIdentityInstructionV2(
        payer.toString(),
        request.url
      );

    if (blinksightsActionIdentityInstruction) {
      transaction.add(blinksightsActionIdentityInstruction);
    }

    const correctVote =
      vote === "1" ? matchData.votes_fighter1 : matchData.votes_fighter2;

    // Add an instruction to execute
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: WWWIAF_PUBKEY,
        lamports: 1000,
      })
    );

    const payload = await createPostResponse({
      fields: {
        transaction,
        links: {
          next: {
            action: {
              icon: `${url.origin}/api/og/reveal?matchId=${matchId}&f1=${f1}&f2=${f2}`,
              type: "action",
              title: `${correctVote} others also thought ${
                vote === "1" ? f1 : f2
              } would win!`,
              description: "Play again for a new matchup!",
              label: "Play again",
              disabled: true,
            },

            type: "inline",
          },
        },
      },
    });
    return NextResponse.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    let message = "An unknown error occurred";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }
    return new NextResponse(message, {
      headers: ACTIONS_CORS_HEADERS,
      status: 500,
    });
  }
};
