"use client";

import { useState, useCallback, useEffect } from "react";

/* ── 카테고리 타입 ── */

type Category = "meme" | "quote" | "humor";

interface MemeItem {
  text: string;
  author?: string;
  emoji: string;
  category: Category;
}

const CATEGORY_LABELS: Record<Category, { label: string; emoji: string }> = {
  meme: { label: "밈", emoji: "🔥" },
  quote: { label: "명언", emoji: "💡" },
  humor: { label: "유머", emoji: "😂" },
};

/* ── 데이터 ── */

const ITEMS: MemeItem[] = [
  // ── 밈 ──
  { text: "Works on my machine ¯\\_(ツ)_/¯", emoji: "🤷", category: "meme" },
  { text: "console.log 디버깅 장인", emoji: "🪵", category: "meme" },
  { text: "git push --force 하고 퇴근", emoji: "💣", category: "meme" },
  { text: "PM: 이거 간단한 거죠?", emoji: "😇", category: "meme" },
  { text: "CSS 센터링하는 데 2시간", emoji: "🎯", category: "meme" },
  { text: "// TODO: 나중에 고치기\n(3년 전 커밋)", emoji: "💀", category: "meme" },
  { text: "이 코드 누가 짰어?\ngit blame → 나", emoji: "🪞", category: "meme" },
  { text: "Stack Overflow 복붙했는데\n동작하는 이유를 모름", emoji: "🧩", category: "meme" },
  { text: "\"금방 될 거예요\"\n— 3스프린트 전", emoji: "⏳", category: "meme" },
  { text: "프로덕션 DB에서 DELETE 실행\nWHERE 절 빼먹음", emoji: "🚨", category: "meme" },
  { text: "merge conflict 99개\n금요일 오후 5시", emoji: "😱", category: "meme" },
  { text: "\"이건 레거시 코드니까 건드리지 마\"", emoji: "🏚️", category: "meme" },
  { text: "if (isWorking) {\n  dontTouch();\n}", emoji: "🙏", category: "meme" },
  { text: "npm install 하는 동안\nnode_modules가 블랙홀이 됨", emoji: "🕳️", category: "meme" },
  { text: "\"테스트 코드는 다음에 작성할게요\"\n(하지 않았다)", emoji: "📜", category: "meme" },

  // ── 명언 ──
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", emoji: "🐧", category: "quote" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", emoji: "📖", category: "quote" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson", emoji: "🧠", category: "quote" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", emoji: "✨", category: "quote" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", emoji: "👓", category: "quote" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs", emoji: "🎯", category: "quote" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House", emoji: "🎭", category: "quote" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck", emoji: "🏃", category: "quote" },
  { text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie", emoji: "💻", category: "quote" },
  { text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates", emoji: "✈️", category: "quote" },
  { text: "It's not a bug — it's an undocumented feature.", author: "Anonymous", emoji: "🐛", category: "quote" },
  { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay", emoji: "⚠️", category: "quote" },
  { text: "Deleted code is debugged code.", author: "Jeff Sickel", emoji: "🗑️", category: "quote" },

  // ── 유머 ──
  { text: "세상에는 10가지 사람이 있다.\n이진법을 아는 사람과 모르는 사람.", emoji: "🔢", category: "humor" },
  { text: "Q: 프로그래머가 싫어하는 것 두 가지?\nA: 코드 리뷰와 코드 리뷰 안 하는 것", emoji: "🔄", category: "humor" },
  { text: "Q: 프로그래머는 왜 할로윈과 크리스마스를 헷갈릴까?\nA: OCT 31 == DEC 25", emoji: "🎃", category: "humor" },
  { text: "\"영원히 반복되는 것 세 가지:\n물, 불, 그리고 npm install\"", emoji: "♾️", category: "humor" },
  { text: "초보: 코드 100줄 작성\n고수: 코드 100줄 삭제", emoji: "🥋", category: "humor" },
  { text: "Q: 배열의 첫 번째 원소는?\nA: 보통 사람 — 1번째\n    프로그래머 — 0번째", emoji: "0️⃣", category: "humor" },
  { text: "어떤 프로그래머가 샤워하다 죽었다.\n샴푸 설명서에 '거품 내고, 헹구고, 반복'이라 쓰여 있었다.", emoji: "🚿", category: "humor" },
  { text: "Q: 개발자가 가장 무서워하는 말?\nA: \"야, 이거 잠깐만\"", emoji: "😨", category: "humor" },
  { text: "\"99개의 버그를 고쳤다.\n벽에 99개의 버그.\n하나를 고치면...\n127개의 버그가 벽에.\"", emoji: "🧱", category: "humor" },
  { text: "프론트엔드 개발자의 악몽:\n\"IE에서도 돼야 합니다\"", emoji: "👻", category: "humor" },
  { text: "Q: 자바와 자바스크립트의 관계는?\nA: 카와 카펫의 관계", emoji: "☕", category: "humor" },
  { text: "\"이 정도면 리팩토링이 아니라\n재건축이다\"", emoji: "🏗️", category: "humor" },
];

/* ── 유틸 ── */

function getRandomIndex(current: number, max: number): number {
  if (max <= 1) return 0;
  let next: number;
  do {
    next = Math.floor(Math.random() * max);
  } while (next === current);
  return next;
}

/* ── 컴포넌트 ── */

export default function MemePage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const filtered = activeCategory === "all"
    ? ITEMS
    : ITEMS.filter((item) => item.category === activeCategory);

  const currentItem = filtered[currentIndex % filtered.length];

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setDirection("right");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => getRandomIndex(prev, filtered.length));
      setIsTransitioning(false);
    }, 250);
  }, [isTransitioning, filtered.length]);

  const handleCopy = useCallback(async () => {
    const text = currentItem.author
      ? `"${currentItem.text}" — ${currentItem.author}`
      : currentItem.text;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext]);

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        {/* Title */}
        <div className="anim-fade-up mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              개발자 한마디
            </span>
            <span className="ml-2">💬</span>
          </h2>
          <p className="mt-2 font-mono text-sm text-zinc-500">
            카드를 클릭하거나 스페이스바를 눌러보세요
          </p>
        </div>

        {/* Category Tabs */}
        <div
          className="anim-fade-up mb-8 flex flex-wrap justify-center gap-2"
          style={{ animationDelay: "0.1s" }}
        >
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-xl border px-4 py-2 font-mono text-sm transition-all ${
              activeCategory === "all"
                ? "border-pink-500/50 bg-pink-500/15 text-pink-400"
                : "border-card-border bg-white/3 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
            }`}
          >
            🎲 전체
          </button>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl border px-4 py-2 font-mono text-sm transition-all ${
                activeCategory === cat
                  ? "border-pink-500/50 bg-pink-500/15 text-pink-400"
                  : "border-card-border bg-white/3 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              {CATEGORY_LABELS[cat].emoji} {CATEGORY_LABELS[cat].label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div
          className="anim-fade-up w-full max-w-lg"
          style={{ animationDelay: "0.15s" }}
        >
          <button
            onClick={handleNext}
            className="group relative w-full cursor-pointer rounded-2xl border border-card-border bg-card-bg/80 p-8 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/30 hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.2)] sm:p-10"
          >
            {/* Emoji Background */}
            <div className="pointer-events-none absolute top-4 right-5 text-6xl opacity-10 transition-opacity group-hover:opacity-20">
              {currentItem.emoji}
            </div>

            {/* Category Badge */}
            <div className="mb-5">
              <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 font-mono text-xs text-pink-400">
                {CATEGORY_LABELS[currentItem.category].emoji}{" "}
                {CATEGORY_LABELS[currentItem.category].label}
              </span>
            </div>

            {/* Content */}
            <div
              className={`transition-all duration-250 ${
                isTransitioning
                  ? "translate-x-4 opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <div className="mb-4 text-5xl">{currentItem.emoji}</div>
              <p className="whitespace-pre-line text-xl font-bold leading-relaxed text-zinc-100 sm:text-2xl">
                {currentItem.text}
              </p>
              {currentItem.author && (
                <p className="mt-4 font-mono text-sm text-zinc-500">
                  — {currentItem.author}
                </p>
              )}
            </div>

            {/* Click hint */}
            <div className="mt-6 flex items-center gap-1.5 font-mono text-xs text-zinc-600 transition-colors group-hover:text-zinc-400">
              <span>탭하여 다음</span>
              <span className="animate-pulse">→</span>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div
          className="anim-fade-up mt-6 flex gap-3"
          style={{ animationDelay: "0.2s" }}
        >
          <button
            onClick={handleNext}
            className="rounded-xl border border-pink-500/40 bg-pink-500/15 px-6 py-2.5 font-mono text-sm text-pink-400 transition-all hover:bg-pink-500/25 hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)] active:scale-95"
          >
            🎲 다음
          </button>
          <button
            onClick={handleCopy}
            className={`rounded-xl border px-6 py-2.5 font-mono text-sm transition-all active:scale-95 ${
              copied
                ? "border-green-500/40 bg-green-500/15 text-green-400"
                : "border-card-border bg-white/3 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            {copied ? "✅ 복사됨!" : "📋 공유"}
          </button>
        </div>

        {/* Counter */}
        <p
          className="anim-fade-up mt-4 font-mono text-xs text-zinc-600"
          style={{ animationDelay: "0.25s" }}
        >
          {filtered.length}개의 문구 중 랜덤 표시
        </p>
      </main>
    </div>
  );
}
