import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELECTION SHOWDOWN: Party Mode!",
  description: "Next.js translation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
