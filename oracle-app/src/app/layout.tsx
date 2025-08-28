import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/oracle.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oracle - Alex Hormozi Wisdom Chatbot",
  description: "Transform your business with Alex Hormozi's wisdom through AI. Get personalized insights, strategies, and guidance for scaling your empire.",
  keywords: "Alex Hormozi, business wisdom, AI chatbot, Oracle, entrepreneurship, scaling business",
  authors: [{ name: "BizInsiderPro" }],
  openGraph: {
    title: "Oracle - Alex Hormozi Wisdom Chatbot",
    description: "Access Alex Hormozi's business wisdom through AI-powered conversations",
    url: "https://bizinsiderpro.com/oracle",
    siteName: "Oracle Wisdom",
    type: "website",
  },
  robots: {
    index: false, // Password protected
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/oracle-icon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
