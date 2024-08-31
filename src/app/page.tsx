"use client";

import dynamic from "next/dynamic";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const BlinkWrapper = dynamic(() => import("@/components/BlinkWrapper"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col bg-stone-950'>
      <nav className='w-full p-4 flex justify-end'>
        <WalletMultiButton className='!bg-black-500 !text-white !rounded-md !font-bold' />
      </nav>
      <main className='flex-grow flex flex-col justify-center items-center text-center w-full max-w-5xl px-4 sm:px-6 lg:px-8 mx-auto'>
        <h1 className='text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-stone-600 to-stone-500'>
          Welcome to <span className='text-stone-500'>Matchups.fun</span>
        </h1>

        <p className='text-2xl mb-8 font-bold text-gray-300'>
          Put your favorite Crypto Twitter characters head-to-head!
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
