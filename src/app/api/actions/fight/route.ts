import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import {
  ComputeBudgetProgram,
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
  const url = new URL(req.url);

  try {
    // Fetch fighters and match from the /api/fighters endpoint
    const fightersResponse = await fetch(`${url.origin}/api/fighters`);
    if (!fightersResponse.ok) {
      throw new Error("Failed to fetch fighters");
    }
    const { fighter1, fighter2, match } = await fightersResponse.json();

    const actionGetResp: ActionGetResponse =
      await blinksights.createActionGetResponseV2(req.url, {
        icon: `${url.origin}/api/og/matchup?f1=${fighter1.username}&f2=${fighter2.username}`,
        title: `Who would win in a fight? ${fighter1.username} vs ${fighter2.username}`,
        description:
          "Vote for who would win in a fight, pay to reveal what everyone else thinks.",
        label: "Vote",
        links: {
          actions: [
            {
              label: `Vote ${fighter1.username}`,
              href: `${url.pathname}?vote=1&f1=${fighter1.username}&f2=${fighter2.username}&matchId=${match.id}`,
            },
            {
              label: `Vote ${fighter2.username}`,
              href: `${url.pathname}?vote=2&f1=${fighter1.username}&f2=${fighter2.username}&matchId=${match.id}`,
            },
          ],
        },
      });

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
    const vote = url.searchParams.get("vote");
    const matchId = url.searchParams.get("matchId");

    const f1 = url.searchParams.get("f1");
    const f2 = url.searchParams.get("f2");

    const requestBody = await request.json();

    const payer = new PublicKey(requestBody.account);
    try {
      await blinksights.trackActionV2(requestBody.account, request.url);
    } catch (err) {
      console.log(err);
    }

    if (!vote) {
      return new NextResponse("Invalid vote", {
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
        microLamports: 100000,
      }),
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000,
      })
    );

    const blinksightsActionIdentityInstruction =
      await blinksights.getActionIdentityInstructionV2(
        payer.toString(),
        request.url
      );

    if (blinksightsActionIdentityInstruction) {
      transaction.add(blinksightsActionIdentityInstruction);
    }

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
              icon: `${url.origin}/api/og/paywall?f1=${f1}&f2=${f2}&matchId=${matchId}&vote=${vote}`, // create OG image
              type: "action",
              title: `You voted for ${f1}, see what everyone else thinks!`,
              description: "Pay to reveal what everyone else thinks.",
              label: "Reveal",
              links: {
                actions: [
                  {
                    label: `0.01 SOL`,
                    href: `/api/actions/paywall?vote=${vote}&matchId=${matchId}&f1=${f1}&f2=${f2}`,
                  },
                  {
                    label: `100 SEND`,
                    href: `/api/actions/paywall?vote=${vote}&matchId=${matchId}&f1=${f1}&f2=${f2}`,
                  },
                ],
              },
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
