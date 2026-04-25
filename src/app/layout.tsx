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
  title: "CalcFDM — Calculadora de impresión 3D",
  description:
    "Calculadora profesional de costos para impresión 3D FDM. Estima precios de filament, tiempo, energía y mano de obra con precisión industrial.",
  keywords: [
    "impresión 3D",
    "FDM",
    "calculadora",
    "costos",
    "filamento",
    "3D printing",
    "price calculator",
  ],
  authors: [{ name: "CalcFDM" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "CalcFDM — Calculadora de impresión 3D",
    description:
      "Calculadora profesional de costos para impresión 3D FDM",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
        {/* Subtle industrial noise texture overlay */}
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
