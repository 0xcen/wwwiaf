import { ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { NextResponse } from "next/server";
import { BlinksightsClient } from "blinksights-sdk";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { supabase } from "@/utils/supabase";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { Debate } from "@/types/schema";

const blinksights = new BlinksightsClient(process.env.BLINKSIGHTS_API_KEY!);
const WWWIAF_PUBKEY = new PublicKey(
  "5FxmqtfPMwx5rUFvbVwFTWjdDpSbLudP2R9VspFiyWTQ"
);

export async function POST(request: Request) {
  const url = new URL(request.url);
  const debateId = url.searchParams.get("debateId");
  const vote = url.searchParams.get("vote");
  const debater = url.searchParams.get("debater");
  const asset = url.searchParams.get("asset");
  const price = url.searchParams.get("price");

  if (!debateId || !debater || !price || !asset) {
    return new NextResponse(
      "Debate ID, debater, price, and asset are required",
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  let debate: Debate;

  try {
    const requestBody = await request.json();
    const payer = new PublicKey(requestBody.account);

    await blinksights.trackActionV2(requestBody.account, request.url);

    const { data: debateData, error } = await supabase
      .from("debates")
      .select("*")
      .eq("id", debateId)
      .maybeSingle();

    debate = debateData as Debate;

    const connection = new Connection(process.env.RPC_URL!);
    const transaction = new Transaction({
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      feePayer: payer,
    });

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

      // Convert amount to token amount based on decimals
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

    // get percentage of people who voted for the debater

    const voteKey = `votes_debater${vote}` as keyof Debate;
    const totalVotes =
      (debate.votes_debater1 ?? 0) + (debate.votes_debater2 ?? 0);
    const percentage =
      totalVotes > 0 ? ((debate[voteKey] as number) / totalVotes) * 100 : 0;

    const payload = await createPostResponse({
      fields: {
        transaction,
        links: {
          next: {
            action: {
              icon: `${url.origin}/api/og/debate-paywall?debateId=${debateId}&vote=${vote}`,
              type: "completed",
              title: `${percentage.toFixed(
                2
              )}% of people also voted for ${debater}!`,
              description: `Total votes: ${totalVotes}. Refresh to get a fresh matchup!`,
              label: "Done",
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
    console.error("Error in POST request:", err);
    return new NextResponse("An error occurred", {
      headers: ACTIONS_CORS_HEADERS,
      status: 500,
    });
  }
}

export const OPTIONS = POST;
