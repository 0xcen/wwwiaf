import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
// ... other imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          {children}
          {process.env.NEXT_PUBLIC_VERCEL_ENV !== "development" && (
            <Analytics />
          )}
        </Providers>
      </body>
    </html>
  );
}
