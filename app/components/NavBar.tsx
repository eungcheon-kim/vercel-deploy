"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/fortune", label: "운세", emoji: "🎰" },
  { href: "/game", label: "2048", emoji: "🧩" },
  { href: "/suika", label: "수박", emoji: "🍉" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 font-mono text-xs transition-colors hover:text-zinc-200"
        >
          <span className="text-accent">~/</span>
          <span className="text-zinc-400">dev-playground</span>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-1 rounded-xl border border-card-border bg-card-bg/70 p-1 backdrop-blur-xl">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs transition-all duration-200 ${
                  isActive
                    ? "bg-accent/15 text-accent-2 shadow-sm"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                }`}
              >
                <span className="text-sm">{item.emoji}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
