import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "QR Car",
  description:
    "Protect your parked car. Anyone who scans your sticker can alert you — anonymously.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="bg-white antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
