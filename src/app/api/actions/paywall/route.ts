import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import {
  Connection,
  LAMPORTS_PER_SOL,
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
  const username1 = url.searchParams.get("1");
  const username2 = url.searchParams.get("2");
  const matchId = "30ouseoe"; //todo: fetch from db
  try {
    const actionGetResp: ActionGetResponse = {
      icon: "https://fav.farm/🔥", // create OG image
      title: `Do you want to know who would win?`,
      description: "Pay to reveal what everyone else thinks.",
      label: "Reveal",
      links: {
        actions: [
          {
            label: `Random`,
            href: `${url.pathname}?vote=1&matchId=${matchId}`,
          },
          {
            label: `random`,
            href: `${url.pathname}?vote=2&matchId=${matchId}`,
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
    // const matchId = url.searchParams.get("matchId");

    const requestBody = await request.json();

    const payer = new PublicKey(requestBody.account);

    const connection = new Connection(process.env.RPC_URL!);

    // Create Simple Transaction
    const transaction = new Transaction({
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      feePayer: payer,
    });

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
              icon: "https://fav.farm/📊", // create OG image
              type: "action",
              title: `x wins`,
              description: "Fun!",
              label: `Fun!`,
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
