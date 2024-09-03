"use client";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ViewToggle } from "@/components/ViewToggle";
import { DebatesView } from "@/components/DebatesView";
import { MainView } from "@/components/MainView";
import Image from "next/image";

export default function Home() {
  const [isDebateView, setIsDebateView] = useState(true);

  return (
    <div className='min-h-screen overflow-auto flex flex-col bg-stone-950'>
      <nav className='w-full p-4 flex justify-between items-center'>
        <ViewToggle
          isDebateView={isDebateView}
          onToggle={() => setIsDebateView(!isDebateView)}
          position='left'
        />
        <WalletMultiButton className='wallet-adapter-button' />
      </nav>
      <main className='flex-grow space-y-4 flex flex-col justify-center items-center text-center w-full max-w-5xl px-4 sm:px-6 lg:px-8 mx-auto'>
        {isDebateView ? (
          <>
            <div className='flex flex-col items-center justify-center'>
              <Image src='/solana.svg' alt='Solana' width={100} height={100} />
            </div>
            <h1 className='text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-br from-[#9945FF] to-[#14F195]'>
              Breakpoint Debates
            </h1>
            <p>
              This year at Breakpoint, there will be a series of spicy debates
              in a parliamentary format.
            </p>
            <p>
              Cast a vote on who you think will win, and see what everyone else
              thinks.
            </p>
            <DebatesView />
          </>
        ) : (
          <>
            <h1 className='text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-stone-600 to-stone-500'>
              Who would win in a fight?
            </h1>
            <p className='text-2xl mb-8 font-bold text-gray-300'>
              CT&apos;s main characters head-to-head!
            </p>
            <div className='max-w-[450px] w-full'>
              <MainView />
            </div>
          </>
        )}
      </main>
      <footer className='mt-8 text-gray-400 font-medium text-center p-4'>
        <p>Who would win? You decide!</p>
      </footer>
    </div>
  );
}
