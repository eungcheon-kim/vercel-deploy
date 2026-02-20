"use client";

import { useState, useCallback } from "react";

// ─── 한국어 문장 풀 ───
const KO_SENTENCES = [
  "동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세.",
  "무궁화 삼천리 화려 강산 대한사람 대한으로 길이 보전하세.",
  "나는 오늘도 별 하나에 추억과 별 하나에 사랑과 별 하나에 쓸쓸함을 새겨봅니다.",
  "산은 높고 물은 맑아 그 사이로 바람이 불어왔다.",
  "끝없는 들판 위에 서서 나는 먼 곳을 바라보았다.",
  "오래된 골목길을 따라 걸으며 지난 시간을 떠올렸다.",
  "하늘에서 눈이 내리기 시작하자 세상이 고요해졌다.",
  "뜨거운 여름날 매미 소리가 골목을 가득 채웠다.",
  "서쪽 하늘이 붉게 물들 때 우리는 강변에 앉아 있었다.",
  "새벽 안개가 걷히자 산 아래 마을이 하나둘 모습을 드러냈다.",
  "할머니가 들려주던 옛이야기는 늘 따뜻한 결말이었다.",
  "봄비가 내리는 오후 창가에 앉아 책을 읽었다.",
  "오래된 다리 아래로 맑은 시냇물이 흐르고 있었다.",
  "바다 건너 먼 나라에서 편지 한 통이 도착했다.",
  "가을이 깊어지면 산은 온통 붉은 빛으로 물든다.",
  "밤하늘에 별이 쏟아지는 것을 바라보며 소원을 빌었다.",
  "시장 골목에서 풍기는 따뜻한 음식 냄새가 발길을 붙잡았다.",
  "오랜 친구를 만나 이야기꽃을 피우니 시간 가는 줄 몰랐다.",
  "작은 연못에 비친 달이 잔잔한 파문과 함께 흔들렸다.",
  "도서관 한 구석에서 먼지 쌓인 책을 발견했다.",
  "이른 아침 안개 낀 숲길을 걸으며 새소리에 귀 기울였다.",
  "어린 시절 뛰놀던 운동장은 여전히 그 자리에 있었다.",
  "겨울밤 벽난로 앞에서 따뜻한 차 한 잔의 여유를 즐겼다.",
  "비가 그친 뒤 무지개가 하늘을 가로질러 나타났다.",
  "기차역 플랫폼에서 누군가를 기다리며 시계를 바라보았다.",
  "수평선 너머로 태양이 천천히 가라앉고 있었다.",
  "강둑 위의 벚꽃이 바람에 흩날리며 꽃비를 만들었다.",
  "오래된 레코드판에서 흘러나오는 음악이 방을 채웠다.",
  "산꼭대기에 오르자 발아래 구름이 펼쳐져 있었다.",
  "전통 시장의 활기찬 소리가 귓가에 울려 퍼졌다.",
];

const KO_FAMOUS_OPENERS = [
  "동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세.",
  "나라 말이 중국과 달라 문자와 서로 통하지 아니하므로.",
  "나는 오늘도 별 하나에 추억과 별 하나에 사랑과 별 하나에 쓸쓸함을 새겨봅니다.",
];

// ─── 클래식 Lorem Ipsum ───
const LOREM_CHUNKS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra.",
  "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.",
  "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui.",
  "Maecenas faucibus mollis interdum. Nullam quis risus eget urna mollis ornare vel eu leo.",
  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cras mattis consectetur purus sit amet fermentum.",
  "Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod.",
  "Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.",
  "Nullam id dolor id nibh ultricies vehicula ut id elit. Cum sociis natoque penatibus et magnis dis parturient montes.",
];

// ─── 개발자 문장 풀 ───
const DEV_SENTENCES = [
  "컴포넌트를 리팩토링하며 추상화 레이어를 분리하는 것이 유지보수의 핵심이다.",
  "마이크로서비스 아키텍처에서 서비스 간 통신은 gRPC 또는 REST로 처리한다.",
  "CI/CD 파이프라인을 구축하면 배포 자동화와 품질 관리를 동시에 달성할 수 있다.",
  "리액트의 Virtual DOM은 실제 DOM 조작을 최소화하여 성능을 최적화한다.",
  "타입스크립트의 제네릭을 활용하면 재사용 가능한 유틸리티 타입을 만들 수 있다.",
  "캐시 무효화 전략을 잘못 설계하면 stale 데이터가 사용자에게 노출된다.",
  "쿠버네티스 클러스터에서 파드 오토스케일링을 설정하여 트래픽 급증에 대비한다.",
  "GraphQL 스키마를 먼저 정의하고 리졸버를 구현하는 스키마 퍼스트 접근법을 따른다.",
  "데드락을 방지하기 위해 락 획득 순서를 일관되게 유지해야 한다.",
  "웹소켓 연결이 끊어지면 지수 백오프로 재연결을 시도하는 것이 일반적이다.",
  "인덱스를 적절히 설정하지 않으면 데이터베이스 쿼리 성능이 급격히 저하된다.",
  "서버사이드 렌더링을 적용하면 초기 로딩 속도와 SEO를 동시에 개선할 수 있다.",
  "함수형 프로그래밍에서 순수 함수와 불변성은 버그를 줄이는 핵심 원칙이다.",
  "레디스를 세션 스토어로 사용하면 수평 확장 시 세션 공유 문제를 해결할 수 있다.",
  "모노레포 구조에서 터보레포를 활용하면 빌드 캐싱으로 CI 시간을 대폭 단축한다.",
  "프론트엔드에서 debounce와 throttle을 적용해 불필요한 API 호출을 줄인다.",
  "테스트 커버리지가 높다고 버그가 없는 것은 아니지만, 리그레션 방지에는 효과적이다.",
  "Docker 컨테이너의 레이어 캐싱을 이해하면 이미지 빌드 시간을 최적화할 수 있다.",
  "API 게이트웨이에서 rate limiting을 적용하여 서비스 과부하를 방지한다.",
  "코드 리뷰는 단순한 버그 발견을 넘어 팀의 코드 품질과 지식 공유를 향상시킨다.",
  "환경 변수를 하드코딩하면 보안 취약점이 발생하므로 반드시 별도로 관리해야 한다.",
  "옵저버 패턴을 활용하면 컴포넌트 간 결합도를 낮추면서 이벤트를 전파할 수 있다.",
  "Lazy loading과 코드 스플리팅으로 초기 번들 사이즈를 줄이는 것이 중요하다.",
  "트랜잭션 격리 수준을 이해하지 못하면 동시성 문제가 발생할 수 있다.",
  "MSW를 사용하면 실제 API 없이도 프론트엔드 개발과 테스트를 진행할 수 있다.",
];

type Mode = "korean" | "english" | "developer";

const MODE_LABELS: Record<Mode, string> = {
  korean: "한국어",
  english: "영어 (클래식)",
  developer: "개발자",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateParagraph(pool: string[], sentencesPerParagraph: number): string {
  const shuffled = shuffle(pool);
  const selected = shuffled.slice(0, sentencesPerParagraph);
  return selected.join(" ");
}

function generate(
  count: number,
  mode: Mode,
  useKoreanOpener: boolean
): string[] {
  const pool =
    mode === "korean"
      ? KO_SENTENCES
      : mode === "english"
        ? LOREM_CHUNKS
        : DEV_SENTENCES;

  const sentencesPerParagraph = mode === "english" ? 4 : 5;
  const paragraphs: string[] = [];

  for (let i = 0; i < count; i++) {
    let para = generateParagraph(pool, sentencesPerParagraph);

    if (i === 0 && useKoreanOpener && mode === "korean") {
      const opener =
        KO_FAMOUS_OPENERS[Math.floor(Math.random() * KO_FAMOUS_OPENERS.length)];
      const rest = generateParagraph(
        pool.filter((s) => s !== opener),
        sentencesPerParagraph - 1
      );
      para = opener + " " + rest;
    }

    paragraphs.push(para);
  }

  return paragraphs;
}

export default function LoremPage() {
  const [count, setCount] = useState(3);
  const [mode, setMode] = useState<Mode>("korean");
  const [useOpener, setUseOpener] = useState(true);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    setParagraphs(generate(count, mode, useOpener));
    setCopied(false);
  }, [count, mode, useOpener]);

  const handleCopy = useCallback(async () => {
    if (paragraphs.length === 0) return;
    const text = paragraphs.join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [paragraphs]);

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        {/* Title */}
        <div className="anim-fade-up mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              더미 텍스트 생성기
            </span>
          </h2>
          <p className="mt-2 font-mono text-sm text-zinc-500">
            한국어 Lorem Ipsum을 빠르게 생성하세요
          </p>
        </div>

        {/* Controls */}
        <div
          className="anim-fade-up mb-6 w-full max-w-2xl rounded-2xl border border-card-border bg-card-bg/60 p-6 backdrop-blur-sm"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Paragraph count */}
          <div className="mb-5">
            <label className="mb-2 block font-mono text-xs text-zinc-400">
              문단 수: <span className="text-teal-400">{count}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full cursor-pointer accent-teal-500"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-600">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Mode selector */}
          <div className="mb-5">
            <label className="mb-2 block font-mono text-xs text-zinc-400">
              모드
            </label>
            <div className="flex gap-2">
              {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
                    mode === m
                      ? "border-teal-500/50 bg-teal-500/15 text-teal-400"
                      : "border-card-border bg-white/3 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Korean opener */}
          {mode === "korean" && (
            <div className="mb-5">
              <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={useOpener}
                  onChange={(e) => setUseOpener(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-600 accent-teal-500"
                />
                유명 문장으로 시작 (동해물과 백두산이...)
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="rounded-xl border border-teal-500/40 bg-teal-500/15 px-6 py-2.5 font-mono text-sm text-teal-400 transition-all hover:bg-teal-500/25 hover:shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)] active:scale-95"
            >
              생성
            </button>
            {paragraphs.length > 0 && (
              <button
                onClick={handleCopy}
                className={`rounded-xl border px-6 py-2.5 font-mono text-sm transition-all active:scale-95 ${
                  copied
                    ? "border-green-500/40 bg-green-500/15 text-green-400"
                    : "border-card-border bg-white/3 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                {copied ? "복사됨!" : "복사"}
              </button>
            )}
          </div>
        </div>

        {/* Result */}
        {paragraphs.length > 0 && (
          <div
            className="anim-fade-up w-full max-w-2xl rounded-2xl border border-card-border bg-card-bg/60 p-6 backdrop-blur-sm"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-600">
                {MODE_LABELS[mode]} · {paragraphs.length}개 문단
              </span>
              <span className="font-mono text-[10px] text-zinc-600">
                {paragraphs.join("\n\n").length.toLocaleString()}자
              </span>
            </div>
            <div className="space-y-4">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-zinc-300/90"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
