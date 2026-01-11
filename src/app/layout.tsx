import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Latino Coucou Beach | Beach Club Ghar El Melh, Tunisie",
  description:
    "Beach club exclusif à Coucou Beach, Ghar El Melh. Restaurant méditerranéen, plage privée, cocktails et ambiance festive. Réservez votre journée du 1er juin au 30 septembre.",
  keywords: [
    "beach club Tunisie",
    "île de Kuriat",
    "Monastir",
    "restaurant plage",
    "plage privée Tunisie",
    "cocktails",
    "événements bord de mer",
    "Latino Coucou Beach",
  ],
  authors: [{ name: "Latino Coucou Beach" }],
  creator: "Latino Coucou Beach",
  publisher: "Latino Coucou Beach",
  formatDetection: {
    telephone: true,
    email: true,
  },
  openGraph: {
    title: "Latino Coucou Beach | Beach Club Ghar El Melh",
    description: "L'expérience beach club ultime à Coucou Beach, Ghar El Melh. Restaurant, plage privée, DJ sets et cocktails sous le soleil tunisien.",
    type: "website",
    locale: "fr_FR",
    siteName: "Latino Coucou Beach",
    url: "https://latinocoucoubeach.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Latino Coucou Beach - Beach Club sur l'île de Kuriat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Latino Coucou Beach | Beach Club Tunisie",
    description: "Beach club exclusif sur l'île de Kuriat. Réservez votre journée paradisiaque.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://latinocoucoubeach.com",
  },
  other: {
    "geo.region": "TN-MO",
    "geo.placename": "Coucou Beach, Ghar El Melh, Monastir",
    "geo.position": "37.14232;10.21041",
    "ICBM": "37.14232, 10.21041",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={outfit.variable}>
      <head>
        {/* Structured Data - LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeachResort",
              name: "Latino Coucou Beach",
              description: "Beach club exclusif sur l'île de Kuriat avec restaurant méditerranéen et plage privée.",
              url: "https://latinocoucoubeach.com",
              telephone: "+216 50 607 072",
              email: "contact@latinocoucoubeach.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Ghar El Melh",
                addressRegion: "Ghar El Melh",
                addressCountry: "TN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 37.14232,
                longitude: 10.21041,
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                opens: "09:00",
                closes: "19:00",
                validFrom: "2026-06-01",
                validThrough: "2026-09-30",
              },
              priceRange: "$$",
              servesCuisine: "Mediterranean",
              image: "https://latinocoucoubeach.com/og-image.jpg",
            }),
          }}
        />
      </head>
      <body className="font-primary antialiased">{children}</body>
    </html>
  );
}
