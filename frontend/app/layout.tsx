import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "@/app/styles/globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["latin", "arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "داشبورد تحلیلی زرین‌پال",
  description: "داشبورد تحلیلی برای فروشندگان زرین‌پال — فاز 3: تحلیل کارمزد تنظیم‌شده، سهم فروش، و فعالیت زمانی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={vazirmatn.variable}>
        {children}
      </body>
    </html>
  );
}