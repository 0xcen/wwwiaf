"use client";

import { Blink, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";

// You may need to import this in your global CSS file
import "@solana/wallet-adapter-react-ui/styles.css";

export default function BlinkWrapper() {
  const actionApiUrl = `${window.location.origin}/fight`;
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(true);

  const { adapter } = useActionSolanaWalletAdapter(
    process.env.NEXT_PUBLIC_RPC_URL!
  );
  const { action } = useAction({ url: actionApiUrl, adapter });

  useEffect(() => {
    if (action) {
      setIsLoading(false);
    }
  }, [action]);

  return (
    <div className='blink-container relative'>
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-radial from-stone-500/20 to-transparent blur-3xl transform scale-150'></div>
      </div>
      {isLoading ? (
        <div className='flex justify-center items-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-stone-500'></div>
        </div>
      ) : action ? (
        <Blink
          action={action}
          websiteText='Matchups.fun'
          stylePreset='custom'
        />
      ) : (
        <div className='text-stone-500'>
          Failed to load action. Please try again.
        </div>
      )}
    </div>
  );
}
