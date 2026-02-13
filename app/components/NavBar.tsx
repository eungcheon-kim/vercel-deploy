"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";

const GAMES = [
  { href: "/fortune", label: "운세", emoji: "🎰" },
  { href: "/game", label: "2048", emoji: "🧩" },
  { href: "/suika", label: "수박", emoji: "🍉" },
  { href: "/reaction", label: "반응", emoji: "⚡" },
  { href: "/flappy", label: "플래피", emoji: "🐤" },
  { href: "/snake", label: "뱀", emoji: "🐍" },
  { href: "/mine", label: "지뢰", emoji: "💣" },
];

export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Auto-scroll to active item
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [pathname]);

  return (
    <>
      {/* Top bar */}
      <nav className="fixed top-0 z-50 w-full">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-xs transition-colors hover:text-zinc-200"
          >
            <span className="text-accent">~/</span>
            <span className="text-zinc-400">dev-playground</span>
          </Link>

          {!isHome && (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg/70 px-3 py-1.5 font-mono text-[11px] text-zinc-500 backdrop-blur-xl transition-all hover:border-zinc-600 hover:text-zinc-200"
            >
              <span className="text-xs">🏠</span>
              <span>전체 보기</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom game dock */}
      {!isHome && (
        <div className="fixed bottom-0 z-50 flex w-full justify-center px-3 pb-3 pt-1">
          <div
            ref={scrollRef}
            className="flex max-w-[calc(100vw-24px)] items-center gap-0.5 overflow-x-auto rounded-2xl border border-card-border bg-card-bg/90 p-1 shadow-2xl shadow-black/50 backdrop-blur-xl scrollbar-none"
          >
            {GAMES.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={isActive ? activeRef : undefined}
                  className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 transition-all duration-150 ${
                    isActive
                      ? "bg-accent/15 text-accent-2"
                      : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <span className={`text-base leading-none transition-transform duration-150 ${isActive ? "scale-110" : ""}`}>
                    {item.emoji}
                  </span>
                  <span className="font-mono text-[8px] leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
