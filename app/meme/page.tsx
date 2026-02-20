"use client";

import { useState, useCallback, useEffect } from "react";

/* ── 카테고리 타입 ── */

type Category = "meme" | "quote" | "humor";

interface MemeItem {
  text: string;
  author?: string;
  emoji: string;
  category: Category;
  reason?: string;
  link?: string;
}

const CATEGORY_LABELS: Record<Category, { label: string; emoji: string }> = {
  meme: { label: "밈", emoji: "🔥" },
  quote: { label: "명언", emoji: "💡" },
  humor: { label: "유머", emoji: "😂" },
};

/* ── 데이터 ── */

const ITEMS: MemeItem[] = [
  // ── 밈 ──
  {
    text: "Works on my machine ¯\\_(ツ)_/¯",
    emoji: "🤷",
    category: "meme",
    reason: "개발자가 로컬에서는 잘 되는데 서버에 배포하면 안 될 때 쓰는 변명. 환경 차이(OS, 의존성 버전 등)로 인한 문제가 원인.",
    link: "https://blog.codinghorror.com/the-works-on-my-machine-certification-program/",
  },
  {
    text: "console.log 디버깅 장인",
    emoji: "🪵",
    category: "meme",
    reason: "디버거를 쓰는 대신 console.log를 수십 개 찍어서 디버깅하는 패턴. 사실 대부분의 개발자가 이렇게 한다.",
  },
  {
    text: "git push --force 하고 퇴근",
    emoji: "💣",
    category: "meme",
    reason: "force push는 원격 커밋 히스토리를 덮어쓰기 때문에 팀원의 작업을 날릴 수 있다. 퇴근 전에 하면 아무도 모를 거라는 희망.",
  },
  {
    text: "PM: 이거 간단한 거죠?",
    emoji: "😇",
    category: "meme",
    reason: "기획자/PM이 \"간단한\" 요구사항을 던지면 실제로는 아키텍처 변경이 필요한 경우가 많다. 개발자의 영원한 트라우마.",
  },
  {
    text: "CSS 센터링하는 데 2시간",
    emoji: "🎯",
    category: "meme",
    reason: "CSS에서 요소를 정중앙에 배치하는 것이 의외로 까다롭다. flexbox 등장 전에는 정말 그랬고, 지금도 상황에 따라 복잡하다.",
    link: "https://css-tricks.com/centering-css-complete-guide/",
  },
  {
    text: "// TODO: 나중에 고치기\n(3년 전 커밋)",
    emoji: "💀",
    category: "meme",
    reason: "TODO 주석은 \"나중에\"를 의미하지만, 실제로는 영원히 방치된다. 코드 고고학의 대표적 유물.",
  },
  {
    text: "이 코드 누가 짰어?\ngit blame → 나",
    emoji: "🪞",
    category: "meme",
    reason: "git blame 명령어는 각 줄의 마지막 수정자를 보여준다. 화가 나서 범인을 찾으면 과거의 자신이라는 아이러니.",
  },
  {
    text: "Stack Overflow 복붙했는데\n동작하는 이유를 모름",
    emoji: "🧩",
    category: "meme",
    reason: "Stack Overflow에서 답변을 복사-붙여넣기하면 일단 동작하지만 원리를 이해하지 못한 채 넘어가는 패턴. 매우 흔함.",
    link: "https://stackoverflow.com/",
  },
  {
    text: "\"금방 될 거예요\"\n— 3스프린트 전",
    emoji: "⏳",
    category: "meme",
    reason: "개발 일정 추정은 항상 낙관적이다. 호프스태터의 법칙: 항상 예상보다 오래 걸린다, 호프스태터의 법칙을 고려하더라도.",
  },
  {
    text: "프로덕션 DB에서 DELETE 실행\nWHERE 절 빼먹음",
    emoji: "🚨",
    category: "meme",
    reason: "WHERE 절 없는 DELETE는 테이블 전체를 삭제한다. 프로덕션 DB에서 실행하면 대참사. 실제로 많은 회사에서 일어난 사고.",
  },
  {
    text: "merge conflict 99개\n금요일 오후 5시",
    emoji: "😱",
    category: "meme",
    reason: "Git merge conflict는 같은 파일을 여러 사람이 수정했을 때 발생. 금요일 퇴근 직전에 터지면 최악의 시나리오.",
  },
  {
    text: "\"이건 레거시 코드니까 건드리지 마\"",
    emoji: "🏚️",
    category: "meme",
    reason: "레거시 코드를 수정하면 예측 불가능한 버그가 생길 수 있어서 아무도 손대지 않는다. 시간이 지나면 점점 더 손댈 수 없게 된다.",
  },
  {
    text: "if (isWorking) {\n  dontTouch();\n}",
    emoji: "🙏",
    category: "meme",
    reason: "\"동작하면 건드리지 말 것\"이라는 개발 금언을 코드로 표현한 것. 왜 동작하는지 모를 때 특히 적용된다.",
  },
  {
    text: "npm install 하는 동안\nnode_modules가 블랙홀이 됨",
    emoji: "🕳️",
    category: "meme",
    reason: "node_modules 폴더는 의존성이 중첩되어 수만 개의 파일과 수백 MB를 차지한다. 우주에서 가장 무거운 물체라는 밈.",
    link: "https://devhumor.com/media/node-modules",
  },
  {
    text: "\"테스트 코드는 다음에 작성할게요\"\n(하지 않았다)",
    emoji: "📜",
    category: "meme",
    reason: "테스트 코드 작성을 미루는 건 기술 부채의 대표적 형태. TDD(테스트 주도 개발)를 알지만 실천하기는 어렵다.",
  },

  // ── 명언 ──
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    emoji: "🐧",
    category: "quote",
    reason: "Linux와 Git의 창시자 리누스 토르발스의 대표 명언. 말보다 실제 코드로 증명하라는 의미. 2000년 리눅스 커널 메일링 리스트에서 유래.",
    link: "https://en.wikipedia.org/wiki/Linus_Torvalds",
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    emoji: "📖",
    category: "quote",
    reason: "리팩토링의 대가 마틴 파울러의 명언. 코드는 기계보다 사람이 읽기 쉬워야 한다는 것이 핵심. 그의 저서 'Refactoring'에서 인용.",
    link: "https://en.wikipedia.org/wiki/Martin_Fowler_(software_engineer)",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    emoji: "🧠",
    category: "quote",
    reason: "코드를 먼저 치기보다 문제를 먼저 이해하고 설계하라는 조언. 바로 코딩에 뛰어드는 실수를 경계하는 말.",
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    emoji: "✨",
    category: "quote",
    reason: "R. Austin Freeman(영국 작가)의 말로, 소프트웨어에서 단순함이 가장 효율적인 해법이라는 KISS 원칙과 연결된다.",
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    emoji: "👓",
    category: "quote",
    reason: "MIT 교수이자 SICP(Structure and Interpretation of Computer Programs)의 저자. 코드의 가독성이 실행보다 중요하다는 철학.",
    link: "https://en.wikipedia.org/wiki/Structure_and_Interpretation_of_Computer_Programs",
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
    emoji: "🎯",
    category: "quote",
    reason: "UX 관점에서 에러를 사전에 방지하는 것이 최선이라는 의미. Zepto.js 개발자인 Thomas Fuchs의 말.",
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    emoji: "🎭",
    category: "quote",
    reason: "자기 설명적(self-documenting) 코드의 중요성을 유머에 비유한 것. 좋은 코드는 설명이 필요 없다.",
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    emoji: "🏃",
    category: "quote",
    reason: "XP(익스트림 프로그래밍)의 창시자 Kent Beck의 개발 3단계 원칙. 먼저 동작하게, 그다음 올바르게, 마지막으로 빠르게.",
    link: "https://en.wikipedia.org/wiki/Kent_Beck",
  },
  {
    text: "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
    emoji: "💻",
    category: "quote",
    reason: "C 언어와 Unix의 공동 창시자. 프로그래밍은 이론이 아닌 실습으로만 배울 수 있다는 경험적 조언.",
    link: "https://en.wikipedia.org/wiki/Dennis_Ritchie",
  },
  {
    text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
    author: "Bill Gates",
    emoji: "✈️",
    category: "quote",
    reason: "코드 양으로 진척도를 측정하는 건 무의미하다는 비유. 적은 코드가 더 좋은 해결책일 수 있다.",
  },
  {
    text: "It's not a bug — it's an undocumented feature.",
    author: "Anonymous",
    emoji: "🐛",
    category: "quote",
    reason: "버그를 \"문서화되지 않은 기능\"이라고 부르는 유서 깊은 개발자 유머. 1980년대부터 쓰여온 표현.",
  },
  {
    text: "The most disastrous thing that you can ever learn is your first programming language.",
    author: "Alan Kay",
    emoji: "⚠️",
    category: "quote",
    reason: "OOP와 Smalltalk의 창시자 Alan Kay. 첫 언어의 사고방식에 갇힐 수 있다는 경고. 다양한 패러다임 학습의 중요성.",
    link: "https://en.wikipedia.org/wiki/Alan_Kay",
  },
  {
    text: "Deleted code is debugged code.",
    author: "Jeff Sickel",
    emoji: "🗑️",
    category: "quote",
    reason: "삭제된 코드에는 버그가 없다는 역설적 진리. 불필요한 코드를 줄이는 것이 최고의 디버깅이라는 의미.",
  },

  // ── 유머 ──
  {
    text: "세상에는 10가지 사람이 있다.\n이진법을 아는 사람과 모르는 사람.",
    emoji: "🔢",
    category: "humor",
    reason: "이진법에서 10은 십진법의 2. 즉 \"2가지 사람\"이라는 뜻인데, 이진법을 모르면 \"10가지\"로 읽는다는 이중 의미 유머.",
  },
  {
    text: "Q: 프로그래머가 싫어하는 것 두 가지?\nA: 코드 리뷰와 코드 리뷰 안 하는 것",
    emoji: "🔄",
    category: "humor",
    reason: "자기 코드가 리뷰되는 건 싫지만, 리뷰 없이 품질이 떨어지는 것도 싫다는 모순적 심리를 표현.",
  },
  {
    text: "Q: 프로그래머는 왜 할로윈과 크리스마스를 헷갈릴까?\nA: OCT 31 == DEC 25",
    emoji: "🎃",
    category: "humor",
    reason: "OCT(8진법) 31 = DEC(10진법) 25. 프로그래밍에서 OCT/DEC은 진법 접두사이면서 October/December의 약자이기도 해서.",
  },
  {
    text: "\"영원히 반복되는 것 세 가지:\n물, 불, 그리고 npm install\"",
    emoji: "♾️",
    category: "humor",
    reason: "npm install은 의존성 트리를 재귀적으로 설치하면서 매우 오래 걸린다. 특히 node_modules가 커질수록 더 오래.",
  },
  {
    text: "초보: 코드 100줄 작성\n고수: 코드 100줄 삭제",
    emoji: "🥋",
    category: "humor",
    reason: "경험이 쌓이면 코드를 추가하기보다 불필요한 코드를 줄이는 것이 더 가치 있다는 걸 깨닫게 된다.",
  },
  {
    text: "Q: 배열의 첫 번째 원소는?\nA: 보통 사람 — 1번째\n    프로그래머 — 0번째",
    emoji: "0️⃣",
    category: "humor",
    reason: "대부분의 프로그래밍 언어에서 배열 인덱스는 0부터 시작한다(zero-indexed). 일상과 프로그래밍의 사고 차이.",
  },
  {
    text: "어떤 프로그래머가 샤워하다 죽었다.\n샴푸 설명서에 '거품 내고, 헹구고, 반복'이라 쓰여 있었다.",
    emoji: "🚿",
    category: "humor",
    reason: "무한 루프(infinite loop) 유머. '반복'이라는 지시에 종료 조건이 없어서 프로그래머가 영원히 반복했다는 설정.",
  },
  {
    text: "Q: 개발자가 가장 무서워하는 말?\nA: \"야, 이거 잠깐만\"",
    emoji: "😨",
    category: "humor",
    reason: "\"잠깐만\"이라고 시작하는 요청은 절대 잠깐이 아니다. 보통 몇 시간에서 며칠짜리 작업이 숨어 있다.",
  },
  {
    text: "\"99개의 버그를 고쳤다.\n벽에 99개의 버그.\n하나를 고치면...\n127개의 버그가 벽에.\"",
    emoji: "🧱",
    category: "humor",
    reason: "99 Bottles of Beer on the Wall 노래의 개발자 버전. 버그를 하나 고치면 새로운 버그가 더 많이 생기는 현실을 풍자.",
  },
  {
    text: "프론트엔드 개발자의 악몽:\n\"IE에서도 돼야 합니다\"",
    emoji: "👻",
    category: "humor",
    reason: "Internet Explorer는 웹 표준을 잘 지키지 않아서 크로스 브라우저 호환이 악몽이었다. 2022년 IE 공식 종료로 해방.",
    link: "https://blogs.windows.com/windowsexperience/2022/06/15/internet-explorer-11-has-retired-and-is-officially-out-of-support/",
  },
  {
    text: "Q: 자바와 자바스크립트의 관계는?\nA: 카와 카펫의 관계",
    emoji: "☕",
    category: "humor",
    reason: "Java와 JavaScript는 이름만 비슷할 뿐 완전히 다른 언어. 1995년 Netscape가 Java의 인기에 편승하려고 이름을 빌려왔다.",
    link: "https://stackoverflow.com/questions/2018731/why-is-javascript-called-javascript-since-it-has-nothing-to-do-with-java",
  },
  {
    text: "\"이 정도면 리팩토링이 아니라\n재건축이다\"",
    emoji: "🏗️",
    category: "humor",
    reason: "리팩토링은 기존 기능을 유지하면서 코드 구조를 개선하는 것. 하지만 변경 범위가 너무 크면 차라리 처음부터 다시 짜는 게 나을 때.",
  },
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
  const [showReason, setShowReason] = useState(false);

  const filtered = activeCategory === "all"
    ? ITEMS
    : ITEMS.filter((item) => item.category === activeCategory);

  const currentItem = filtered[currentIndex % filtered.length];

  useEffect(() => {
    setCurrentIndex(0);
    setShowReason(false);
  }, [activeCategory]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowReason(false);
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
          <div className="group relative w-full rounded-2xl border border-card-border bg-card-bg/80 p-8 backdrop-blur-sm transition-all duration-300 hover:border-pink-500/30 hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.2)] sm:p-10">
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
            <button
              onClick={handleNext}
              className={`w-full cursor-pointer text-left transition-all duration-250 ${
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
            </button>

            {/* Reason / Context */}
            {currentItem.reason && (
              <div className="mt-5 border-t border-card-border pt-4">
                <button
                  onClick={() => setShowReason((v) => !v)}
                  className="flex w-full items-center gap-2 font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform duration-200 ${showReason ? "rotate-90" : ""}`}
                  >
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                  <span>{showReason ? "설명 접기" : "왜 이게 유명할까? 💡"}</span>
                </button>

                {showReason && (
                  <div className="mt-3 rounded-xl bg-white/3 px-4 py-3">
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {currentItem.reason}
                    </p>
                    {currentItem.link && (
                      <a
                        href={currentItem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-accent-2 transition-colors hover:text-accent"
                      >
                        🔗 참고 링크
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Click hint */}
            <div className="mt-5 flex items-center gap-1.5 font-mono text-xs text-zinc-600 transition-colors group-hover:text-zinc-400">
              <span>카드를 탭하면 다음</span>
              <span className="animate-pulse">→</span>
            </div>
          </div>
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
