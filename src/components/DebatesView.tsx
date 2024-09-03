"use client";

import { Blink, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Debate {
  id: string;
  topic: string;
  debater1: string;
  debater2: string;
  votes_debater1: number;
  votes_debater2: number;
  last_blink: Date | null;
  image_url: string;
}

export function DebatesView() {
  const searchParams = useSearchParams();
  const debateId = searchParams.get("debateId");
  const [isLoading, setIsLoading] = useState(true);

  const actionApiUrl = useMemo(() => {
    if (!window) return "";
    return `${window.location.origin}/debates/matchup${
      debateId ? `?debateId=${debateId}` : ""
    }`;
  }, [debateId]);

  const { adapter } = useActionSolanaWalletAdapter(
    process.env.NEXT_PUBLIC_RPC_URL!
  );
  const { action } = useAction({ url: actionApiUrl, adapter });

  useEffect(() => {
    if (action) {
      setIsLoading(false);
    }
  }, [action]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-stone-500'></div>
      </div>
    );
  }

  return action ? (
    <div className='mt-4 max-w-[450px] w-full blink-container relative'>
      <Blink
        action={action}
        websiteText='matchups.fun/breakpoint'
        stylePreset='x-dark'
      />
    </div>
  ) : (
    <div className='text-stone-500'>
      Failed to load action. Please try again.
    </div>
  );
}
