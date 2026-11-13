import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: 'ReTag',
  description: 'Second-hand fashion and circular clothing.',
};

const generalSans = localFont({
  src: '../../public/fonts/GeneralSans-Variable.woff2',
  variable: "--font-general-sans",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={generalSans.variable}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
