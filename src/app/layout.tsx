import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "D-Calc — Free 3D Printing Price Calculator | FDM Cost Estimator",
  description:
    "Free professional FDM 3D printing price calculator. Estimate filament, time, energy and labor costs with industrial precision. No account required. Track projects, sales and statistics.",
  keywords: [
    "3D printing calculator",
    "FDM price calculator",
    "3D printing cost",
    "filament cost estimator",
    "3D print price",
    "FDM calculator",
    "3D printing business",
    "print cost calculator",
    "3D printer price estimator",
    "free 3D printing calculator",
    "no registration calculator",
    "3D printing cost estimator",
    "impresión 3D calculadora",
    "calculadora impresión 3D",
    "3D Druck Preisrechner",
    "calculateur impression 3D",
    "3D打印价格计算器",
    "3D inprimaketa kalkulagailua",
    "D-Calc",
    "piece manager 3D",
    "3D printing business tool",
  ],
  authors: [{ name: "D-Calc" }],
  creator: "D-Calc",
  publisher: "D-Calc",
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
  openGraph: {
    title: "D-Calc — Free 3D Printing Price Calculator",
    description:
      "Professional FDM 3D printing cost calculator. Free, no account needed. Estimate prices, track projects and sales.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_ES", "zh_CN", "eu_ES"],
    siteName: "D-Calc",
  },
  twitter: {
    card: "summary_large_image",
    title: "D-Calc — Free 3D Printing Price Calculator",
    description:
      "Professional FDM 3D printing cost calculator. Free, no account needed.",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "D-Calc",
              description: "Free professional FDM 3D printing price calculator",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              featureList: [
                "FDM 3D printing cost calculation",
                "Multiple pricing tiers",
                "Project management",
                "Sales tracking",
                "Export reports",
                "Multi-currency support",
                "No account required",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
