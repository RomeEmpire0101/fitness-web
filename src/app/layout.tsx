import type { Metadata, Viewport } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormForge | Probabilistic Physique Lab",
  description:
    "A per-muscle resistance-training projection grounded in longitudinal cohorts, with body-component accounting and calibrated prediction intervals.",
  openGraph: {
    title: "FormForge | Probabilistic Physique Lab",
    description:
      "Explore study-anchored regional hypertrophy estimates with transparent uncertainty.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FormForge | Probabilistic Physique Lab",
    description:
      "Study-anchored regional hypertrophy estimates with transparent uncertainty.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f2f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
