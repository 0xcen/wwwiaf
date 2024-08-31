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
  const url = new URL(req.url);
  try {
    const actionGetResp: ActionGetResponse = {
      icon: "", // create OG image
      title: "",
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
    // const matchId = url.searchParams.get("matchId");

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
