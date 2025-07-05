import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import {  ClerkProvider} from '@clerk/nextjs'

const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Morphiq",
  description: "AI_powered image generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0404F1",
        },
      }}
    >
      <html lang="en">
        <body className={`${IBMPlex.className} antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
