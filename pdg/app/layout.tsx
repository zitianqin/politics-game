import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PEERSUADE",
  description: "Next.js translation",
  icons: {
    icon: "/speech.png",
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
