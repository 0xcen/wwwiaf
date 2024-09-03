import { getPrice } from "@/utils/pricing";
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
import { BlinksightsClient } from "blinksights-sdk";
import { NextResponse } from "next/server";
import { getFighters } from "@/utils/fighters"; // You'll need to create this utility function

// Remove the logger import
// import { logger } from "@/utils/logger";

const WWWIAF_PUBKEY = new PublicKey(
  "5FxmqtfPMwx5rUFvbVwFTWjdDpSbLudP2R9VspFiyWTQ"
);

const blinksights = new BlinksightsClient(process.env.BLINKSIGHTS_API_KEY!);

export async function GET(req: Request, res: Response) {
  const url = new URL(req.url);
  const fighter1Param = url.searchParams.get("fighter1");
  const fighter2Param = url.searchParams.get("fighter2");

  try {
    let fetchUrl = `${url.origin}/api/fighters`;

    if (fighter1Param && fighter2Param) {
      fetchUrl += `?fighter1=${fighter1Param}&fighter2=${fighter2Param}`;
    }

    let { fighter1, fighter2, match } = await fetch(fetchUrl).then(res =>
      res.json()
    );

    console.log(
      `Creating action get response for fighters: ${fighter1.username} vs ${fighter2.username}`
    );
    const actionGetResp: ActionGetResponse =
      await blinksights.createActionGetResponseV2(req.url, {
        icon: `${url.origin}/api/og/matchup?f1=${fighter1.username}&f2=${fighter2.username}`,
        title: `Who would win in a fight? ${fighter1.username} vs ${fighter2.username}`,
        description:
          "Vote for who would win in a fight, pay to reveal what everyone else thinks. You can pay with SOL or SEND.",
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
    console.error(
      `Error in GET request: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
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

    // Add an instruction to execute
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: WWWIAF_PUBKEY,
        lamports: 1000,
      })
    );

    const price = getPrice();

    const payload = await createPostResponse({
      fields: {
        transaction,
        links: {
          next: {
            action: {
              icon: `${url.origin}/api/og/paywall?f1=${f1}&f2=${f2}&matchId=${matchId}&vote=${vote}`, // create OG image
              type: "action",
              title: `You voted for ${
                vote === "1" ? f1 : f2
              }, see what everyone else thinks!`,
              description: "Pay to reveal what everyone else thinks.",
              label: "Reveal",
              links: {
                actions: [
                  {
                    label: `${price.sol} SOL`,
                    href: `/api/actions/paywall?vote=${vote}&matchId=${matchId}&f1=${f1}&f2=${f2}&asset=SOL&price=${price.sol}`,
                  },
                  {
                    label: `${price.send} SEND`,
                    href: `/api/actions/paywall?vote=${vote}&matchId=${matchId}&f1=${f1}&f2=${f2}&asset=SEND&price=${price.send}`,
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
