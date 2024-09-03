import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { NextResponse } from "next/server";
import { BlinksightsClient } from "blinksights-sdk";
import { supabase } from "@/utils/supabase";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { getPrice } from "@/utils/pricing";
import { Debate } from "@/types/schema";

const blinksights = new BlinksightsClient(process.env.BLINKSIGHTS_API_KEY!);

const WWWIAF_PUBKEY = new PublicKey(
  "5FxmqtfPMwx5rUFvbVwFTWjdDpSbLudP2R9VspFiyWTQ"
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  let debateId = url.searchParams.get("debateId");

  if (!debateId) {
    try {
    } catch (err) {
      console.error("Error fetching random debate:", err);
      return new NextResponse("Failed to fetch random debate", {
        headers: ACTIONS_CORS_HEADERS,
        status: 500,
      });
    }
  }

  let debate: Debate;
  try {
    if (!debateId) {
      const randomDebateResponse = await fetch(
        `${url.origin}/api/debates/random`
      );
      if (!randomDebateResponse.ok) {
        throw new Error("Failed to fetch random debate");
      }
      const randomDebate = await randomDebateResponse.json();

      debate = randomDebate as Debate;
    } else {
      const { data, error } = await supabase
        .from("debates")
        .select("*")
        .eq("id", debateId)
        .single();

      debate = data as Debate;
    }

    const actionGetResp: ActionGetResponse =
      await blinksights.createActionGetResponseV2(req.url, {
        icon: `${url.origin}/api/og/debate-matchup?debateId=${debate.id}`,
        title: `${debate.topic}`,
        description: `${debate.debater1} vs ${debate.debater2}. Who do you think will win?`,
        type: "action",
        label: "Vote",
        links: {
          actions: [
            {
              label: `Vote ${debate.debater1}`,
              href: `${url.pathname}?vote=1&debateId=${debate.id}&debater=${debate.debater1}`,
            },
            {
              label: `Vote ${debate.debater2}`,
              href: `${url.pathname}?vote=2&debateId=${debate.id}&debater=${debate.debater2}`,
            },
          ],
        },
      });

    return NextResponse.json(actionGetResp, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.error("Error in GET request:", err);
    return new NextResponse("An error occurred", {
      headers: ACTIONS_CORS_HEADERS,
      status: 500,
    });
  }
}

export const OPTIONS = GET;

export const POST = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const vote = url.searchParams.get("vote");
    const debateId = url.searchParams.get("debateId");
    const debater = url.searchParams.get("debater");

    const requestBody = await request.json();

    const payer = new PublicKey(requestBody.account);
    try {
      await blinksights.trackActionV2(requestBody.account, request.url);
    } catch (err) {
      console.log(err);
    }

    if (!vote || !debateId) {
      return new NextResponse("Invalid vote or debate information", {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      });
    }

    const connection = new Connection(process.env.RPC_URL!);

    // Create Simple Transaction
    const transaction = new Transaction({
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      feePayer: payer,
    });

    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 10,
      }),
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000,
      })
    );

    // Add an instruction to execute
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: WWWIAF_PUBKEY,
        lamports: 1,
      })
    );

    const price = getPrice();

    const payload = await createPostResponse({
      fields: {
        transaction,
        links: {
          next: {
            action: await blinksights.createActionGetResponseV2(request.url, {
              icon: `${url.origin}/api/og/debate-paywall?debateId=${debateId}&vote=${vote}`,
              type: "action",
              title: `You voted for ${debater}, see what everyone else thinks!`,
              description: "Pay to reveal what everyone else thinks.",
              label: "Reveal",
              links: {
                actions: [
                  {
                    label: `${price.sol} SOL`,
                    href: `/api/actions/debates/paywall?vote=${vote}&debateId=${debateId}&debater=${debater}&asset=SOL&price=${price.sol}`,
                  },
                  {
                    label: `${price.send} SEND`,
                    href: `/api/actions/debates/paywall?vote=${vote}&debateId=${debateId}&debater=${debater}&asset=SEND&price=${price.send}`,
                  },
                ],
              },
            }),
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
