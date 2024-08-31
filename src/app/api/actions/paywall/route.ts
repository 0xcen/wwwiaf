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
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";

const WWWIAF_PUBKEY = new PublicKey(
  "5FxmqtfPMwx5rUFvbVwFTWjdDpSbLudP2R9VspFiyWTQ"
);

const blinksights = new BlinksightsClient(process.env.BLINKSIGHTS_API_KEY!);

export async function GET(req: Request, res: Response) {
  try {
    // this whole block doesn't matter because in action chaining it gets added in the previous action
    const actionGetResp: ActionGetResponse = {
      icon: "https://placehold.co/600x400", // create OG image
      type: "action",
      title: ``,
      description: "",
      label: "Get",
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
    const asset = url.searchParams.get("asset");
    const price = url.searchParams.get("price");

    if (!vote || !matchId || !asset || !price) {
      throw new Error("Vote, matchId, asset, and price are required");
    }

    const { data: matchData, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    const requestBody = await request.json();
    const payer = new PublicKey(requestBody.account);

    try {
      await blinksights.trackActionV2(requestBody.account, request.url);
    } catch (err) {
      console.log(err);
    }

    const connection = new Connection(process.env.RPC_URL!);

    // Create Transaction
    const transaction = new Transaction({
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      feePayer: payer,
    });

    const correctVote =
      vote === "1" ? matchData.votes_fighter1 : matchData.votes_fighter2;

    let amount: bigint;

    if (asset === "SOL") {
      // Convert price to lamports (1 SOL = 10^9 lamports)
      amount = BigInt(parseFloat(price) * 1e9);

      // Add SOL transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: WWWIAF_PUBKEY,
          lamports: amount,
        })
      );
    } else {
      // Handle token transfer
      const mint = new PublicKey("SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa");
      const mintInfo = await getMint(connection, mint);

      // Convert price to token amount based on decimals
      amount = BigInt(Math.round(parseFloat(price) * 10 ** mintInfo.decimals));

      const destinationATA = await getAssociatedTokenAddress(
        mint,
        WWWIAF_PUBKEY
      );

      // Check if the destination ATA exists
      const destinationAccount = await connection.getAccountInfo(
        destinationATA
      );

      if (!destinationAccount) {
        // If the ATA doesn't exist, create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            payer,
            destinationATA,
            WWWIAF_PUBKEY,
            mint
          )
        );
      }

      // Add token transfer instruction
      transaction.add(
        createTransferInstruction(
          await getAssociatedTokenAddress(mint, payer),
          destinationATA,
          payer,
          amount
        )
      );
    }

    const payload = await createPostResponse({
      fields: {
        transaction,
        links: {
          next: {
            action: {
              icon: `${url.origin}/api/og/reveal?matchId=${matchId}&f1=${f1}&f2=${f2}`,
              type: "completed",
              title: `${
                correctVote === 1 ? "1 other person" : correctVote + " others"
              } also thought ${vote === "1" ? f1 : f2} would win!`,
              description: "🔄 Refresh to get a fresh matchup!",
              label: "Refresh to play again!",
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
    console.log("🚀 ~ POST ~ err:", err);
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
