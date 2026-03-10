"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { getOrCreateUser, setNickname as saveNickname, getUUID } from "../lib/user";

const GAMES = [
  { href: "/fortune", label: "운세", emoji: "🎰" },
  { href: "/game", label: "2048", emoji: "🧩" },
  { href: "/suika", label: "수박", emoji: "🍉" },
  { href: "/reaction", label: "반응", emoji: "⚡" },
  { href: "/flappy", label: "플래피", emoji: "🐤" },
  { href: "/snake", label: "뱀", emoji: "🐍" },
  { href: "/mine", label: "지뢰", emoji: "💣" },
  { href: "/memory", label: "메모리", emoji: "🃏" },
  { href: "/colormatch", label: "컬러", emoji: "🎨" },
  { href: "/aim", label: "에임", emoji: "🎯" },
  { href: "/maze", label: "미로", emoji: "🏁" },
  { href: "/sudoku", label: "스도쿠", emoji: "🔢" },
  { href: "/typing", label: "타이핑", emoji: "⌨️" },
  { href: "/wordle", label: "워들", emoji: "🟩" },
  { href: "/breakout", label: "벽돌깨기", emoji: "🧱" },
  { href: "/baseball", label: "숫자야구", emoji: "⚾" },
  { href: "/tetris", label: "테트리스", emoji: "🧱" },
  { href: "/whackmole", label: "두더지", emoji: "🔨" },
];

const TOOLS = [
  { href: "/json", label: "JSON", emoji: "📋" },
  { href: "/regex", label: "정규식", emoji: "🔍" },
  { href: "/color", label: "색상", emoji: "🎨" },
  { href: "/lorem", label: "더미", emoji: "📝" },
  { href: "/pomodoro", label: "타이머", emoji: "🍅" },
  { href: "/ascii", label: "ASCII", emoji: "🔤" },
  { href: "/quiz", label: "퀴즈", emoji: "🧠" },
  { href: "/meme", label: "밈", emoji: "😂" },
  { href: "/mbti", label: "MBTI", emoji: "🧬" },
];

const CATEGORIES = [
  { id: "game" as const, label: "게임", emoji: "🎮", items: GAMES },
  { id: "tool" as const, label: "도구", emoji: "🛠", items: TOOLS },
];

type CategoryId = (typeof CATEGORIES)[number]["id"];

const PATH_TO_CATEGORY = new Map<string, CategoryId>();
CATEGORIES.forEach((cat) => cat.items.forEach((item) => PATH_TO_CATEGORY.set(item.href, cat.id)));

export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const currentCategory = PATH_TO_CATEGORY.get(pathname);
  const showDock = !!currentCategory;

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState("");
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [dockTab, setDockTab] = useState<CategoryId>("game");
  const [dockOpen, setDockOpen] = useState(true);

  // Initialize user on mount
  useEffect(() => {
    const user = getOrCreateUser();
    setNickname(user.nickname);
  }, []);

  // Sync dock tab with current page
  useEffect(() => {
    if (currentCategory) setDockTab(currentCategory);
  }, [currentCategory]);

  const activeCat = CATEGORIES.find((c) => c.id === dockTab)!;

  // Auto-scroll to active item
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: "smooth" });
    }
  }, [pathname, dockTab]);

  // Focus input on edit
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setEditValue(nickname);
    setEditing(true);
  };

  const confirmEdit = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== nickname) {
      saveNickname(trimmed);
      setNickname(trimmed);

      // Sync to Redis
      const uuid = getUUID();
      if (uuid) {
        fetch("/api/scores", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid, nickname: trimmed }),
        }).catch(() => {}); // fire-and-forget
      }
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

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

          <div className="flex items-center gap-1.5">
            {/* Nickname badge */}
            {!editing ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-1 rounded-lg border border-card-border bg-card-bg/70 px-2.5 py-1.5 font-mono text-[11px] text-zinc-400 backdrop-blur-xl transition-all hover:border-zinc-600 hover:text-zinc-200"
                title="닉네임 수정"
              >
                <span className="max-w-[80px] truncate">{nickname}</span>
                <span className="text-[9px] text-zinc-600">✏️</span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  maxLength={20}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  onBlur={confirmEdit}
                  className="w-[120px] rounded-lg border border-accent/40 bg-zinc-900/90 px-2.5 py-1.5 font-mono text-[11px] text-white outline-none backdrop-blur-xl"
                />
              </div>
            )}

            <Link
              href="/ranking"
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] backdrop-blur-xl transition-all ${
                pathname === "/ranking"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                  : "border-card-border bg-card-bg/70 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              <span className="text-xs">🏆</span>
              <span className="hidden sm:inline">랭킹</span>
            </Link>
            {!isHome && (
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg/70 px-3 py-1.5 font-mono text-[11px] text-zinc-500 backdrop-blur-xl transition-all hover:border-zinc-600 hover:text-zinc-200"
              >
                <span className="text-xs">🏠</span>
                <span className="hidden sm:inline">홈</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom dock */}
      {showDock && (
        <div className="fixed bottom-0 z-50 flex w-full justify-center px-3 pb-3 pt-1">
          {dockOpen ? (
            <div className="flex max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-card-border bg-card-bg/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {/* Category tab bar */}
              <div className="flex items-center border-b border-card-border px-1.5 py-1">
                <div className="flex items-center gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setDockTab(cat.id)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-[10px] transition-all ${
                        dockTab === cat.id
                          ? "bg-accent/15 text-accent-2"
                          : "text-zinc-600 hover:bg-white/5 hover:text-zinc-300"
                      }`}
                    >
                      <span className="text-xs leading-none">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setDockOpen(false)}
                  className="ml-auto rounded-lg px-1.5 py-1 text-zinc-600 transition-colors hover:text-zinc-300"
                  title="독 접기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>

              {/* Items */}
              <div
                ref={scrollRef}
                className="flex items-center gap-0.5 overflow-x-auto p-1 scrollbar-none"
              >
                {activeCat.items.map((item) => {
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
          ) : (
            <button
              onClick={() => setDockOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-card-border bg-card-bg/90 px-3.5 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all hover:border-zinc-600 hover:bg-white/5"
              title="독 열기"
            >
              <span className="text-sm">{activeCat.emoji}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><polyline points="6 15 12 9 18 15"/></svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
