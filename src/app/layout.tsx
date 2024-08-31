import "@dialectlabs/blinks/index.css";
import "./globals.css";
import WalletProviderComponent from "@/components/WalletProvider";

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
        <WalletProviderComponent>{children}</WalletProviderComponent>
      </body>
    </html>
  );
}
