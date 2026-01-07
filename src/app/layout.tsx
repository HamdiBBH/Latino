import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Latino Coucou Beach | Beach Club & Restaurant",
  description:
    "Latino Coucou Beach - Votre beach club de rêve. Restaurant, bar, plage privée et événements sous le soleil méditerranéen.",
  keywords: [
    "beach club",
    "restaurant",
    "plage privée",
    "cocktails",
    "événements",
    "Méditerranée",
  ],
  openGraph: {
    title: "Latino Coucou Beach | Beach Club & Restaurant",
    description: "L'expérience beach club ultime sous le soleil méditerranéen",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={outfit.variable}>
      <body className="font-primary antialiased">{children}</body>
    </html>
  );
}
