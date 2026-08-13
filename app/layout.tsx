import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://piping-portal-all-calculation.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Pipe Calculator | All Calculator",
    template: "%s | All Calculator",
  },

  description:
    "Pipe Calculator provides piping engineering calculations including pipe weight, pipe dimensions, pipe thickness, flow velocity, pressure drop, Reynolds number, thermal expansion and engineering unit conversions.",

  keywords: [
    "Pipe Calculator",
    "Pipe Weight Calculator",
    "Pipe Thickness Calculator",
    "Pipe Dimension Calculator",
    "Pipe ID Calculator",
    "Pipe OD Calculator",
    "Pipe Flow Calculator",
    "Flow Velocity Calculator",
    "Pressure Drop Calculator",
    "Reynolds Number Calculator",
    "Thermal Expansion Calculator",
    "Piping Engineering Calculator",
    "Piping Calculator",
    "Engineering Calculator",
    "Pipe Engineering Tools",
    "All Calculator",
  ],

  authors: [
    {
      name: "All Calculator",
    },
  ],

  creator: "All Calculator",
  publisher: "All Calculator",

  applicationName: "All Calculator",

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
    siteName: "All Calculator",
    title: "Pipe Calculator | All Calculator",
    description:
      "Professional pipe and piping engineering calculators for pipe weight, dimensions, flow velocity, pressure drop, Reynolds number, thermal expansion and engineering calculations.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Pipe Calculator | All Calculator",
    description:
      "Pipe calculators and piping engineering calculation tools from All Calculator.",
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