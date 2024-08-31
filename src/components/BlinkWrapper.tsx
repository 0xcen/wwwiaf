"use client";

import { Blink, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// You may need to import this in your global CSS file
import "@solana/wallet-adapter-react-ui/styles.css";

export default function BlinkWrapper() {
  const actionApiUrl = `${window.location.origin}/fight`;
  const wallet = useWallet();

  const { adapter } = useActionSolanaWalletAdapter(
    process.env.NEXT_PUBLIC_RPC_URL!
  );
  const { action } = useAction({ url: actionApiUrl, adapter });

  return (
    <div className='blink-container'>
      {action && (
        <Blink
          action={action}
          websiteText='Matchups.fun'
          stylePreset='custom'
        />
      )}
    </div>
  );
}
