import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
// import {cn} from "@/lib/utils";
import "./globals.css";
import {  ClerkProvider} from '@clerk/nextjs'
import Header from "@/component/shared/Header";

const IBMPlex  = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700']
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
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${IBMPlex.className} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
