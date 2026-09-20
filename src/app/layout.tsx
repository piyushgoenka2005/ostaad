import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ostaad.shop"),
  title: "Ostaad · Verified Construction Materials & Direct Mill Procurement",
  description:
    "Direct mill procurement for structural construction materials. Verified IS standards (OPC 53/43 cement, IS 710 marine plywood, vitrified tiles, low-VOC coatings). Zero retail markups.",
  keywords: [
    "Ostaad",
    "OPC 53 cement price",
    "IS 710 marine plywood",
    "construction materials India",
    "BOQ procurement",
    "direct mill cement",
  ],
  icons: {
    icon: "/brand/ostaad-logo.png",
    apple: "/brand/ostaad-logo.png",
  },
  openGraph: {
    title: "Ostaad · Verified Construction Materials & Direct Mill Procurement",
    description:
      "Direct mill procurement with verified IS standards, certified clinker grade compliance, and transparent bill-of-quantities costing.",
    url: "https://ostaad.shop",
    siteName: "Ostaad",
    images: [
      {
        url: "/brand/ostaad-logo.png",
        width: 800,
        height: 800,
        alt: "Ostaad Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF7F4] text-[#54524D]">
        <FloatingNav />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
