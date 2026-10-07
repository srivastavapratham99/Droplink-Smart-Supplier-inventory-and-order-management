import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Droplink | Smart Supplier Inventory & Order Management",
  description: "Next-gen dropshipping platform linking suppliers with retailers. Real-time inventory sync, automated order fulfillment, and profit metrics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Navbar />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-800 bg-slate-900/60 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Droplink Dropshipping Network. All rights reserved.</p>
            <div className="flex space-x-4 text-slate-400">
              <a href="#" className="hover:text-white transition">Supplier Docs</a>
              <a href="#" className="hover:text-white transition">API Status</a>
              <a href="#" className="hover:text-white transition">Fulfillment SLA</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
