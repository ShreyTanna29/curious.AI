import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToasterProvider } from "@/components/extra/toaster.provider";
import { CrispProvider } from "@/components/extra/crisp-provider";
import NextTopLoader from "nextjs-toploader";
import { Provider } from "@/packages/provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Curious.AI",
  description:
    "An AI for your each and every need, from asking any questions to generating code to generating images and videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/logo.png" sizes="any" />
      <CrispProvider />
      <body
        className={`${geistSans.variable} dark:bg-black ${geistMono.variable} antialiased`}
      >
        <NextTopLoader showSpinner={false} />
        <ToasterProvider />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
