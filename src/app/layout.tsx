import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Miyi Ðekae - Plateforme d'Entraide Moto | Université de Lomé",
  description:
    "La première plateforme d'entraide moto entre étudiants de l'Université de Lomé. Trouvez des trajets, demandez de l'aide, et rejoignez une communauté de motards passionnés et bienveillants.",
  keywords: [
    "moto",
    "entraide",
    "covoiturage",
    "étudiants",
    "Université de Lomé",
    "Togo",
  ],
  authors: [{ name: "Miyi Ðekae" }],
  creator: "Miyi Ðekae",
  publisher: "Miyi Ðekae",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://miyi-dekae.tg",
    siteName: "Miyi Ðekae",
    title: "Miyi Ðekae - Plateforme d'Entraide Moto",
    description:
      "Connectez-vous, partagez et roulez en confiance avec la communauté moto de l'UL",
    images: [
      {
        url: "https://miyi-dekae.tg/og-image.png",
        width: 1200,
        height: 630,
        alt: "Miyi Ðekae - Plateforme d'Entraide Moto",
        type: "image/png",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
