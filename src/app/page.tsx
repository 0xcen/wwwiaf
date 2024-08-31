"use client";

import dynamic from "next/dynamic";

const BlinkWrapper = dynamic(() => import("@/components/BlinkWrapper"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col justify-between items-center bg-gray-100 p-4'>
      <main className='flex-grow flex flex-col justify-center items-center text-center w-full max-w-5xl px-4 sm:px-6 lg:px-8'>
        <h1 className='text-4xl font-bold mb-4'>
          Welcome to <span className='text-blue-600'>Matchups.fun</span>
        </h1>

        <p className='text-xl mb-8'>
          Put your favorite Crypto Twitter characters head-to-head!
        </p>

        <div className='max-w-96 w-full'>
          <BlinkWrapper />
        </div>
      </main>

      <footer className='mt-8 text-gray-600'>
        <p>Who would win? You decide!</p>
      </footer>
    </div>
  );
}
