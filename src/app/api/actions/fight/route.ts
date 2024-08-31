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

const WWWIAF_PUBKEY = new PublicKey(
  "5FxmqtfPMwx5rUFvbVwFTWjdDpSbLudP2R9VspFiyWTQ"
);

export async function GET(req: Request, res: Response) {
  const url = new URL(req.url);

  try {
    // Fetch fighters and match from the /api/fighters endpoint
    const fightersResponse = await fetch(`${url.origin}/api/fighters`);
    if (!fightersResponse.ok) {
      throw new Error("Failed to fetch fighters");
    }
    const { fighter1, fighter2, match } = await fightersResponse.json();

    const actionGetResp: ActionGetResponse = {
      icon: `${url.origin}/api/og/matchup?username1=${fighter1.username}&username2=${fighter2.username}`,
      title: `Who would win in a fight? ${fighter1.username} vs ${fighter2.username}`,
      description:
        "Vote for who would win in a fight, pay to reveal what everyone else thinks.",
      label: "Vote",
      links: {
        actions: [
          {
            label: `Vote ${fighter1.username}`,
            href: `${url.pathname}?vote=1&matchId=${match.id}`,
          },
          {
            label: `Vote ${fighter2.username}`,
            href: `${url.pathname}?vote=2&matchId=${match.id}`,
          },
        ],
      },
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
    const vote = url.searchParams.get("vote");
    const matchId = url.searchParams.get("matchId");

    const username1 = url.searchParams.get("1");
    const username2 = url.searchParams.get("2");

    const requestBody = await request.json();

    const payer = new PublicKey(requestBody.account);

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
        microLamports: 10000,
      }),
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 500,
      })
    );

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
              icon: `${url.origin}/api/og/paywall?username1=${username1}&username2=${username2}`, // create OG image
              type: "action",
              title: `Who would win i a fight? ${username1} vs ${username2}`,
              description:
                "Vote for who would win in a fight, pay to reveal what everyone else thinks.",
              label: "Vote",
              links: {
                actions: [
                  {
                    label: `0.01 SOL`,
                    href: `/api/actions/paywall?matchId=${matchId}`,
                  },
                  {
                    label: `100 SEND`,
                    href: `/api/actions/paywall?matchId=${matchId}`,
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
