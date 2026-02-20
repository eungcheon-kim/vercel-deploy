"use client";

import { useState, useEffect, useCallback } from "react";
import figlet from "figlet";
import standard from "figlet/fonts/Standard";
import banner from "figlet/fonts/Banner3";
import doom from "figlet/fonts/Doom";
import big from "figlet/fonts/Big";
import slant from "figlet/fonts/Slant";
import small from "figlet/fonts/Small";
import isometric1 from "figlet/fonts/Isometric1";
import threeD from "figlet/fonts/3D-ASCII";
import block from "figlet/fonts/Block";
import larry3d from "figlet/fonts/Larry 3D";

const FONTS = [
  { name: "Standard", font: standard },
  { name: "Banner3", font: banner },
  { name: "Doom", font: doom },
  { name: "Big", font: big },
  { name: "Slant", font: slant },
  { name: "Small", font: small },
  { name: "Isometric1", font: isometric1 },
  { name: "3D-ASCII", font: threeD },
  { name: "Block", font: block },
  { name: "Larry 3D", font: larry3d },
] as const;

export default function AsciiArtPage() {
  const [text, setText] = useState("HELLO");
  const [fontIdx, setFontIdx] = useState(0);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    FONTS.forEach((f) => {
      figlet.parseFont(f.name, f.font as unknown as string);
    });
    setFontsReady(true);
  }, []);

  useEffect(() => {
    if (!fontsReady || !text) {
      setResult("");
      return;
    }
    try {
      const output = figlet.textSync(text, {
        font: FONTS[fontIdx].name as figlet.Fonts,
      });
      setResult(output);
    } catch {
      setResult("");
    }
  }, [text, fontIdx, fontsReady]);

  const copy = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [result]);

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-4 pt-16 pb-24 sm:px-6">
        <div className="anim-fade-up mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
              ASCII 아트
            </span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            텍스트를 입력하면 ASCII 아트로 변환됩니다
          </p>
        </div>

        <div
          className="anim-fade-up mb-4 w-full max-w-3xl"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="overflow-hidden rounded-xl border border-card-border bg-card-bg/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-card-border px-4 py-2.5">
              <span className="font-mono text-xs text-zinc-500">입력</span>
              <span className="font-mono text-xs text-zinc-600">
                {text.length}자
              </span>
            </div>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="텍스트를 입력하세요"
              maxLength={30}
              spellCheck={false}
              className="w-full bg-transparent px-4 py-3 font-mono text-lg text-zinc-200 outline-none placeholder:text-zinc-700"
            />
          </div>
        </div>

        <div
          className="anim-fade-up mb-4 flex w-full max-w-3xl flex-wrap items-center gap-2"
          style={{ animationDelay: "0.15s" }}
        >
          {FONTS.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setFontIdx(i)}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-all active:scale-95 ${
                fontIdx === i
                  ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
                  : "border-card-border bg-card-bg text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              }`}
            >
              {f.name}
            </button>
          ))}

          <div className="mx-1 hidden h-6 w-px bg-card-border sm:block" />

          <button
            onClick={copy}
            disabled={!result}
            className="rounded-lg border border-card-border bg-card-bg px-4 py-1.5 font-mono text-xs text-zinc-400 transition-all hover:bg-white/5 hover:text-zinc-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {copied ? "✅ 복사됨!" : "📋 복사"}
          </button>
        </div>

        <div
          className="anim-fade-up w-full max-w-3xl"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="overflow-hidden rounded-xl border border-card-border bg-card-bg/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-card-border px-4 py-2.5">
              <span className="font-mono text-xs text-zinc-500">미리보기</span>
              <span className="font-mono text-xs text-zinc-600">
                {FONTS[fontIdx].name}
              </span>
            </div>
            {result ? (
              <div className="scrollbar-none overflow-x-auto p-4">
                <pre className="font-mono text-[10px] leading-tight text-emerald-400/90 sm:text-xs">
                  {result}
                </pre>
              </div>
            ) : (
              <div className="flex min-h-[150px] items-center justify-center">
                <p className="font-mono text-sm text-zinc-700">
                  {fontsReady
                    ? "위에 텍스트를 입력하면 여기에 ASCII 아트가 표시됩니다"
                    : "폰트 로딩 중..."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="anim-fade-up mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] text-zinc-700"
          style={{ animationDelay: "0.4s" }}
        >
          <span>영문 대소문자</span>
          <span>·</span>
          <span>숫자 · 특수문자</span>
          <span>·</span>
          <span>{FONTS.length}가지 폰트</span>
        </div>
      </main>
    </div>
  );
}
