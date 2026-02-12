import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "개발자 운세 가챠 🎰 | Dev Fortune Gacha",
  description:
    "매일 달라지는 개발자 운세를 뽑아보세요! RPG 스타일 스탯 카드로 오늘의 코딩 운을 확인합니다.",
  openGraph: {
    title: "개발자 운세 가챠 🎰",
    description: "오늘의 개발자 운세를 뽑아보세요! SSS 등급을 노려봅시다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
