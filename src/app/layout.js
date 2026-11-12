
import "./globals.css";

export const metadata = {
  title: {
    default: "RIVEXTRA | Your Identity. One Unique Link.",
    template: "%s | RIVEXTRA",
  },

  description:
    "Create your digital identity with RIVEXTRA. Generate beautiful QR cards and share your personal profile through one unique link.",

  applicationName: "RIVEXTRA",

  keywords: [
    "RIVEXTRA",
    "QR Card Generator",
    "Digital Profile",
    "QR Code",
    "Digital Identity",
  ],

  authors: [{ name: "RIVEXTRA" }],

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
