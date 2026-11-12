import "./globals.css";

export const metadata = {
  // මූලික තොරතුරු
  title: {
    default: "RIVEXTRA | Your Digital Identity & QR Card",
    template: "%s | RIVEXTRA",
  },
  description:
    "Create your digital identity with RIVEXTRA. Generate beautiful QR cards and share your personal profile through one unique link. Fast, secure, and modern.",
  
  // වෙබ් අඩවියේ මූලික URL එක (Domain එක මෙතනට දාන්න)
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  
  // Keywords
  keywords: [
    "RIVEXTRA",
    "QR Card Generator",
    "Digital Profile",
    "QR Code",
    "Digital Identity",
    "Student QR Card",
    "Sri Lanka QR",
    "School QR",
    "Rivisanda"
  ],
  
  // අයිතිකරු
  authors: [{ name: "RIVEXTRA Team", url: "https://rivextra.com" }],
  creator: "RIVEXTRA",
  publisher: "RIVEXTRA",

  // සෙවුම් යන්ත්‍ර (Search Engines)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // OpenGraph (Facebook, WhatsApp, LinkedIn වල Share කරද්දී පේන දේවල්)
  openGraph: {
    title: "RIVEXTRA | Your Digital Identity & QR Card",
    description: "Create your digital identity with RIVEXTRA. Generate beautiful QR cards and share your personal profile through one unique link.",
    url: "/",
    siteName: "RIVEXTRA",
    images: [
      {
        // 👇 ඔයා කිව්ව og-image.png එක මෙතනට දැම්මා
        url: "/assets/og-image.png", 
        width: 1200,
        height: 630,
        alt: "RIVEXTRA Digital Identity Card",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card (X වල Share කරද්දී)
  twitter: {
    card: "summary_large_image",
    title: "RIVEXTRA | Your Digital Identity & QR Card",
    description: "Create your digital identity with RIVEXTRA. Generate beautiful QR cards.",
    images: ["/assets/og-image.png"], // 👇 මෙතනත් og-image.png දාන්න
  },

  // Icons (ඔයා assets folder එකට දාපු නිසා path එක වෙනස් කළා)
  icons: {
    icon: [
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon.ico", sizes: "any" }
    ],
    shortcut: "/assets/favicon.ico",
    apple: "/assets/apple-touch-icon.png",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/assets/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/assets/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/assets/android-chrome-512x512.png",
      }
    ]
  },
  
  // PWA Manifest (ඔයා ළඟ site.webmanifest එකක් තියෙනවා නම්)
  manifest: "/assets/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
