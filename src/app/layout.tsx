import "@dialectlabs/blinks/index.css";
import "./globals.css";
import WalletProviderComponent from "@/components/WalletProvider";
import { Analytics } from "@vercel/analytics/next";

// Remove this line:
// import "../jobs/updateRankings";

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
      <body>
        {process.env.NEXT_PUBLIC_VERCEL_ENV !== "development" && <Analytics />}
        <WalletProviderComponent>{children}</WalletProviderComponent>
      </body>
    </html>
  );
}
