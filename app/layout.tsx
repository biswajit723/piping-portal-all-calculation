import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const siteUrl =
  "https://piping-portal-all-calculation-aiygib1px-b721260-4852s-projects.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "JEET OS | Piping Engineering Calculator",
    template: "%s | JEET OS",
  },

  description:
    "JEET OS is a piping engineering calculator portal for pipe weight, pipe dimensions, flow velocity, pressure drop, Reynolds number, thermal expansion, offset calculations and engineering unit conversions.",

  keywords: [
    "JEET OS",
    "Piping Engineering Calculator",
    "Pipe Weight Calculator",
    "Pipe Thickness Calculator",
    "Pipe ID Calculator",
    "Pipe OD Calculator",
    "Flow Velocity Calculator",
    "Pressure Drop Calculator",
    "Reynolds Number Calculator",
    "Thermal Expansion Calculator",
    "Piping Engineering Tools",
    "Engineering Calculator",
    "Pipe Engineering",
    "Piping Tools",
  ],

  authors: [
    {
      name: "Engineer Jeet",
    },
  ],

  creator: "Engineer Jeet",
  publisher: "JEET OS",

  applicationName: "JEET OS",

  category: "Engineering",

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "JEET OS",
    title: "JEET OS | Piping Engineering Calculator",
    description:
      "Professional piping engineering calculators for pipe weight, flow velocity, pressure drop, Reynolds number, thermal expansion, pipe dimensions and engineering unit conversion.",
  },

  twitter: {
    card: "summary_large_image",
    title: "JEET OS | Piping Engineering Calculator",
    description:
      "Piping engineering calculators and engineering utilities by JEET OS.",
  },

  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}