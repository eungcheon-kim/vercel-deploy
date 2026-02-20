"use client";

import { useState, useCallback } from "react";

/* ── HSL 변환 유틸 ── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

function hslShift(hex: string, hDelta: number, sDelta = 0, lDelta = 0): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const nr = hslToRgb(
    h + hDelta,
    Math.max(0, Math.min(1, s + sDelta)),
    Math.max(0, Math.min(1, l + lDelta))
  );
  return rgbToHex(...nr);
}

/* ── 팔레트 생성 ── */

interface ColorInfo {
  hex: string;
  rgb: [number, number, number];
}

function makeColor(hex: string): ColorInfo {
  return { hex, rgb: hexToRgb(hex) };
}

function generatePalettes(base: string) {
  const complementary = [makeColor(hslShift(base, 180))];

  const analogous = [
    makeColor(hslShift(base, -30)),
    makeColor(base),
    makeColor(hslShift(base, 30)),
  ];

  const triadic = [
    makeColor(base),
    makeColor(hslShift(base, 120)),
    makeColor(hslShift(base, 240)),
  ];

  const splitComplementary = [
    makeColor(hslShift(base, 150)),
    makeColor(hslShift(base, 210)),
  ];

  const [r, g, b] = hexToRgb(base);
  const [h, s] = rgbToHsl(r, g, b);
  const shades = [0.15, 0.3, 0.5, 0.7, 0.85].map((l) =>
    makeColor(rgbToHex(...hslToRgb(h, s, l)))
  );

  return { complementary, analogous, triadic, splitComplementary, shades };
}

function randomHex(): string {
  return (
    "#" +
    Array.from({ length: 6 }, () =>
      "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
    ).join("")
  );
}

/* ── 색상 카드 ── */

function ColorCard({ color }: { color: ColorInfo }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(color.hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }, [color.hex]);

  const [r, g, b] = color.rgb;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textClass = brightness > 140 ? "text-zinc-900" : "text-white";

  return (
    <button
      onClick={copy}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-card-border bg-card-bg transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-600"
    >
      <div
        className="flex h-20 items-end justify-end p-2"
        style={{ backgroundColor: color.hex }}
      >
        {copied && (
          <span
            className={`rounded-md bg-black/30 px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm ${textClass}`}
          >
            복사됨!
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2">
        <span className="font-mono text-xs font-semibold text-zinc-200">
          {color.hex}
        </span>
        <span className="font-mono text-[10px] text-zinc-500">
          rgb({r}, {g}, {b})
        </span>
      </div>
    </button>
  );
}

/* ── 팔레트 섹션 ── */

function PaletteSection({
  title,
  colors,
  delay,
}: {
  title: string;
  colors: ColorInfo[];
  delay: string;
}) {
  return (
    <div className="anim-fade-up w-full" style={{ animationDelay: delay }}>
      <h3 className="mb-3 font-mono text-sm font-medium text-zinc-400">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {colors.map((c, i) => (
          <ColorCard key={`${c.hex}-${i}`} color={c} />
        ))}
      </div>
    </div>
  );
}

/* ── Tailwind 테마 코드 생성 ── */

const SHADE_STEPS = [
  { key: "50", l: 0.95 },
  { key: "100", l: 0.9 },
  { key: "200", l: 0.8 },
  { key: "300", l: 0.7 },
  { key: "400", l: 0.6 },
  { key: "500", l: 0.5 },
  { key: "600", l: 0.4 },
  { key: "700", l: 0.3 },
  { key: "800", l: 0.2 },
  { key: "900", l: 0.15 },
  { key: "950", l: 0.1 },
];

function generateScale(baseHex: string): { key: string; hex: string }[] {
  const [r, g, b] = hexToRgb(baseHex);
  const [h, s] = rgbToHsl(r, g, b);
  return SHADE_STEPS.map(({ key, l }) => ({
    key,
    hex: rgbToHex(...hslToRgb(h, s, l)),
  }));
}

function generateTailwindTheme(base: string) {
  const roles: { name: string; hex: string; desc: string }[] = [
    { name: "primary", hex: base, desc: "기준 색상" },
    { name: "secondary", hex: hslShift(base, 30), desc: "유사색 (+30°)" },
    { name: "accent", hex: hslShift(base, 180), desc: "보색" },
    { name: "tertiary", hex: hslShift(base, 120), desc: "삼각 배색 (+120°)" },
    { name: "quaternary", hex: hslShift(base, 240), desc: "삼각 배색 (+240°)" },
  ];

  const scales = roles.map(({ name, hex, desc }) => ({
    name,
    desc,
    hex,
    steps: generateScale(hex),
  }));

  // CSS 변수 방식 (Tailwind v4)
  const cssLines = [
    `/* 기준 색상: ${base} */`,
    `@theme {`,
    ...scales.flatMap(({ name, desc, steps }) => [
      `  /* ${name} — ${desc} */`,
      ...steps.map(({ key, hex }) => `  --color-${name}-${key}: ${hex};`),
      ``,
    ]),
    `}`,
  ];

  // JS 설정 방식
  const jsLines = [
    `/* 기준 색상: ${base} */`,
    `colors: {`,
    ...scales.flatMap(({ name, desc, steps }) => [
      `  // ${name} — ${desc}`,
      `  ${name}: {`,
      ...steps.map(({ key, hex }) => `    ${key}: "${hex}",`),
      `  },`,
    ]),
    `}`,
  ];

  return {
    css: cssLines.join("\n"),
    js: jsLines.join("\n"),
    scales,
  };
}

function TailwindExport({ base }: { base: string }) {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState<"css" | "js">("css");
  const theme = generateTailwindTheme(base);
  const code = tab === "css" ? theme.css : theme.js;

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="anim-fade-up w-full" style={{ animationDelay: "0.5s" }}>
      <button
        onClick={() => setShow(!show)}
        className="mb-3 flex items-center gap-2 font-mono text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <span className={`transition-transform ${show ? "rotate-90" : ""}`}>▶</span>
        Tailwind CSS 전체 테마
        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent-2">5색 × 11단계</span>
      </button>

      {show && (
        <div className="flex flex-col gap-4">
          {/* Color scale preview */}
          <div className="flex flex-col gap-2">
            {theme.scales.map(({ name, hex, steps }) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-20 shrink-0 font-mono text-[10px] text-zinc-500">{name}</span>
                <div className="flex flex-1 gap-0.5 overflow-hidden rounded-lg">
                  {steps.map(({ key, hex: stepHex }) => (
                    <div
                      key={key}
                      className="h-6 flex-1"
                      style={{ backgroundColor: stepHex }}
                      title={`${name}-${key}: ${stepHex}`}
                    />
                  ))}
                </div>
                <span className="w-16 shrink-0 font-mono text-[9px] text-zinc-600">{hex}</span>
              </div>
            ))}
          </div>

          {/* Code block */}
          <div className="relative rounded-xl border border-card-border bg-zinc-900/80">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-card-border px-3 py-2">
              <div className="flex gap-1">
                <button
                  onClick={() => setTab("css")}
                  className={`rounded-md px-2.5 py-1 font-mono text-[10px] transition-all ${
                    tab === "css" ? "bg-accent/15 text-accent-2" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  @theme (v4)
                </button>
                <button
                  onClick={() => setTab("js")}
                  className={`rounded-md px-2.5 py-1 font-mono text-[10px] transition-all ${
                    tab === "js" ? "bg-accent/15 text-accent-2" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  config.js
                </button>
              </div>
              <button
                onClick={copy}
                className="rounded-lg border border-card-border bg-card-bg px-3 py-1 font-mono text-[10px] text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
              >
                {copied ? "복사됨!" : "복사"}
              </button>
            </div>
            <pre className="max-h-80 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-zinc-400 scrollbar-none">
              {code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 메인 페이지 ── */

export default function ColorPage() {
  const [hex, setHex] = useState("#8B5CF6");
  const [inputValue, setInputValue] = useState("#8B5CF6");

  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(inputValue);

  const applyColor = useCallback(
    (value: string) => {
      const upper = value.toUpperCase();
      if (/^#[0-9A-Fa-f]{6}$/.test(upper)) {
        setHex(upper);
        setInputValue(upper);
      }
    },
    []
  );

  const handleRandom = () => {
    const c = randomHex();
    setHex(c);
    setInputValue(c);
  };

  const palettes = generatePalettes(hex);

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="anim-fade-up text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-rose-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              색상 팔레트
            </span>
            <span className="ml-2">🎨</span>
          </h2>
          <p
            className="anim-fade-up mt-2 font-mono text-xs text-zinc-500"
            style={{ animationDelay: "0.1s" }}
          >
            색상을 선택하면 다양한 조합을 자동 생성합니다
          </p>
        </div>

        {/* Color Picker */}
        <div
          className="anim-fade-up mb-10 flex flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-card-border bg-card-bg px-4 py-3">
            <div className="relative">
              <input
                type="color"
                value={hex}
                onChange={(e) => applyColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0"
              />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                let v = e.target.value.toUpperCase();
                if (!v.startsWith("#")) v = "#" + v;
                if (v.length <= 7) {
                  setInputValue(v);
                  if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
                    setHex(v);
                  }
                }
              }}
              onBlur={() => {
                if (isValidHex) setHex(inputValue.toUpperCase());
                else setInputValue(hex);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValidHex) {
                  setHex(inputValue.toUpperCase());
                }
              }}
              maxLength={7}
              spellCheck={false}
              className={`w-24 rounded-lg border bg-zinc-900/60 px-3 py-2 font-mono text-sm text-zinc-200 outline-none transition-colors ${
                isValidHex
                  ? "border-card-border focus:border-accent/50"
                  : "border-red-500/50"
              }`}
            />
            <button
              onClick={handleRandom}
              className="flex items-center gap-1.5 rounded-lg border border-card-border bg-white/3 px-3 py-2 font-mono text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
            >
              🎲 랜덤
            </button>
          </div>
        </div>

        {/* Base Color Preview */}
        <div
          className="anim-fade-up mb-10 flex items-center gap-4 rounded-2xl border border-card-border bg-card-bg px-5 py-4"
          style={{ animationDelay: "0.2s" }}
        >
          <div
            className="h-14 w-14 shrink-0 rounded-xl shadow-lg"
            style={{ backgroundColor: hex }}
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-lg font-bold text-zinc-100">
              {hex}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              rgb({hexToRgb(hex).join(", ")})
            </span>
            <span className="font-mono text-[10px] text-zinc-600">
              hsl(
              {rgbToHsl(...hexToRgb(hex))
                .map((v, i) =>
                  i === 0
                    ? Math.round(v) + "°"
                    : Math.round(v * 100) + "%"
                )
                .join(", ")}
              )
            </span>
          </div>
        </div>

        {/* Palettes */}
        <div className="flex w-full max-w-2xl flex-col gap-8">
          <PaletteSection
            title="보색 (Complementary)"
            colors={palettes.complementary}
            delay="0.25s"
          />
          <PaletteSection
            title="유사색 (Analogous)"
            colors={palettes.analogous}
            delay="0.3s"
          />
          <PaletteSection
            title="삼각 배색 (Triadic)"
            colors={palettes.triadic}
            delay="0.35s"
          />
          <PaletteSection
            title="분할 보색 (Split-complementary)"
            colors={palettes.splitComplementary}
            delay="0.4s"
          />
          <PaletteSection
            title="명도 변화 (Lightness)"
            colors={palettes.shades}
            delay="0.45s"
          />

          {/* Tailwind CSS 테마 코드 */}
          <TailwindExport base={hex} />
        </div>
      </main>
    </div>
  );
}
