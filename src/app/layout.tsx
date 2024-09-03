import "@dialectlabs/blinks/index.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import WalletProviderComponent from "@/components/WalletProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Matchups.fun - CT Character Battles",
  description: "Put your favorite Crypto Twitter characters head-to-head!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='dark'>
        {process.env.NEXT_PUBLIC_VERCEL_ENV !== "development" && <Analytics />}
        <WalletProviderComponent>{children}</WalletProviderComponent>
      </body>
    </html>
  );
}
