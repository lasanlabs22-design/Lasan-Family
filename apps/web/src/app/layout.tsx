import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: { default: "Lasan Family: Trusted maids & home cooks in Andhra Pradesh and Telangana", template: "%s" },
  description:
    "Verified women maids and home cooks for women at home across Hyderabad, Warangal, Tirupati, Vijayawada, Visakhapatnam and Guntur. Daily cleaning, laundry and fresh home-cooked meals made to your taste and diet.",
};

export const viewport: Viewport = {
  themeColor: "#fbf6f1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
