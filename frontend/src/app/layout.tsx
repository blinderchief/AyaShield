import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aya Shield — AI-Powered Transaction Firewall",
  description:
    "Protect every crypto transaction with AI-powered security. Simulate, analyze, and shield before you sign.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Aya Shield — AI-Powered Transaction Firewall",
    description: "Protect every crypto transaction with AI-powered security. Simulate, analyze, and shield before you sign.",
    siteName: "Aya Shield",
    images: [{ url: "/poster.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aya Shield — AI-Powered Transaction Firewall",
    description: "Protect every crypto transaction with AI-powered security.",
    images: ["/poster.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
