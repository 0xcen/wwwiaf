"use client";

import dynamic from "next/dynamic";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const BlinkWrapper = dynamic(() => import("@/components/BlinkWrapper"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className='min-h-screen overflow-auto flex flex-col bg-stone-950'>
      <nav className='w-full p-4 flex justify-end'>
        <WalletMultiButton className='wallet-adapter-button' />
      </nav>
      <main className='flex-grow flex flex-col justify-center items-center text-center w-full max-w-5xl px-4 sm:px-6 lg:px-8 mx-auto'>
        <h1 className='text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-stone-600 to-stone-500'>
          Who would win in a fight?
        </h1>

        <p className='text-2xl mb-8 font-bold text-gray-300'>
          CT&apos;s main characters head-to-head!
        </p>

        <div className='max-w-[450px] w-full'>
          <BlinkWrapper />
        </div>
      </main>

      <footer className='mt-8 text-gray-400 font-medium text-center p-4'>
        <p>Who would win? You decide!</p>
      </footer>
    </div>
  );
}
