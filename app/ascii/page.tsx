"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

type Mode = "text" | "image";

const ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

function imageToAscii(
  img: HTMLImageElement,
  maxWidth: number,
  charset: string,
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const ratio = img.height / img.width;
  const w = Math.min(maxWidth, img.width);
  const h = Math.round(w * ratio * 0.45);

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;
  const lines: string[] = [];

  for (let y = 0; y < h; y++) {
    let line = "";
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      const charIdx = Math.floor((brightness / 255) * (charset.length - 1));
      line += charset[charIdx];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export default function AsciiArtPage() {
  const [mode, setMode] = useState<Mode>("text");

  // Text mode state
  const [text, setText] = useState("HELLO");
  const [fontIdx, setFontIdx] = useState(0);
  const [textResult, setTextResult] = useState("");
  const [fontsReady, setFontsReady] = useState(false);

  // Image mode state
  const [imageResult, setImageResult] = useState("");
  const [imageWidth, setImageWidth] = useState(100);
  const [invert, setInvert] = useState(false);
  const [imageName, setImageName] = useState("");
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);

  const result = mode === "text" ? textResult : imageResult;

  useEffect(() => {
    FONTS.forEach((f) => {
      figlet.parseFont(f.name, f.font as unknown as string);
    });
    setFontsReady(true);
  }, []);

  useEffect(() => {
    if (!fontsReady || !text) {
      setTextResult("");
      return;
    }
    try {
      const output = figlet.textSync(text, {
        font: FONTS[fontIdx].name as figlet.Fonts,
      });
      setTextResult(output);
    } catch {
      setTextResult("");
    }
  }, [text, fontIdx, fontsReady]);

  const processImage = useCallback(() => {
    if (!imageRef.current) return;
    const charset = invert ? ASCII_CHARS : [...ASCII_CHARS].reverse().join("");
    const ascii = imageToAscii(imageRef.current, imageWidth, charset);
    setImageResult(ascii);
  }, [imageWidth, invert]);

  useEffect(() => {
    if (mode === "image" && imageRef.current) {
      processImage();
    }
  }, [mode, imageWidth, invert, processImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        processImage();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        processImage();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

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
            텍스트 또는 이미지를 ASCII 아트로 변환합니다
          </p>
        </div>

        {/* Mode Tabs */}
        <div
          className="anim-fade-up mb-4 flex gap-2"
          style={{ animationDelay: "0.05s" }}
        >
          <button
            onClick={() => setMode("text")}
            className={`rounded-lg border px-4 py-2 font-mono text-xs transition-all ${
              mode === "text"
                ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
                : "border-card-border bg-card-bg text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}
          >
            ⌨️ 텍스트
          </button>
          <button
            onClick={() => setMode("image")}
            className={`rounded-lg border px-4 py-2 font-mono text-xs transition-all ${
              mode === "image"
                ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
                : "border-card-border bg-card-bg text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            }`}
          >
            🖼️ 이미지
          </button>
        </div>

        {/* TEXT MODE */}
        {mode === "text" && (
          <>
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
            </div>
          </>
        )}

        {/* IMAGE MODE */}
        {mode === "image" && (
          <>
            {/* Drop zone / Upload */}
            <div
              className="anim-fade-up mb-4 w-full max-w-3xl"
              style={{ animationDelay: "0.1s" }}
            >
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-card-border bg-card-bg/80 p-8 transition-all hover:border-lime-500/30 hover:bg-lime-500/5"
              >
                <span className="text-4xl">🖼️</span>
                <p className="font-mono text-sm text-zinc-400">
                  {imageName || "클릭하거나 이미지를 드래그하세요"}
                </p>
                <p className="font-mono text-[10px] text-zinc-600">
                  JPG, PNG, GIF, WebP 지원
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Image controls */}
            {imageRef.current && (
              <div
                className="anim-fade-up mb-4 flex w-full max-w-3xl flex-wrap items-center gap-4"
                style={{ animationDelay: "0.15s" }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-500">너비</span>
                  <input
                    type="range"
                    min={40}
                    max={200}
                    value={imageWidth}
                    onChange={(e) => setImageWidth(Number(e.target.value))}
                    className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-card-border accent-lime-500"
                  />
                  <span className="font-mono text-xs text-zinc-400">{imageWidth}</span>
                </div>

                <button
                  onClick={() => setInvert((v) => !v)}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-all active:scale-95 ${
                    invert
                      ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
                      : "border-card-border bg-card-bg text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                  }`}
                >
                  {invert ? "🌙 다크 배경" : "☀️ 밝은 배경"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Copy button */}
        <div
          className="anim-fade-up mb-4 flex w-full max-w-3xl justify-end"
          style={{ animationDelay: "0.18s" }}
        >
          <button
            onClick={copy}
            disabled={!result}
            className="rounded-lg border border-card-border bg-card-bg px-4 py-1.5 font-mono text-xs text-zinc-400 transition-all hover:bg-white/5 hover:text-zinc-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {copied ? "✅ 복사됨!" : "📋 복사"}
          </button>
        </div>

        {/* Result */}
        <div
          className="anim-fade-up w-full max-w-3xl"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="overflow-hidden rounded-xl border border-card-border bg-card-bg/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-card-border px-4 py-2.5">
              <span className="font-mono text-xs text-zinc-500">미리보기</span>
              <span className="font-mono text-xs text-zinc-600">
                {mode === "text" ? FONTS[fontIdx].name : imageName || "이미지"}
              </span>
            </div>
            {result ? (
              <div className="scrollbar-none overflow-x-auto p-4">
                <pre
                  className={`font-mono leading-none ${
                    mode === "image"
                      ? "text-[3px] text-emerald-400/90 sm:text-[5px]"
                      : "text-[10px] leading-tight text-emerald-400/90 sm:text-xs"
                  }`}
                >
                  {result}
                </pre>
              </div>
            ) : (
              <div className="flex min-h-[150px] items-center justify-center">
                <p className="font-mono text-sm text-zinc-700">
                  {mode === "text"
                    ? fontsReady
                      ? "위에 텍스트를 입력하면 여기에 ASCII 아트가 표시됩니다"
                      : "폰트 로딩 중..."
                    : "이미지를 업로드하면 ASCII 아트로 변환됩니다"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="anim-fade-up mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] text-zinc-700"
          style={{ animationDelay: "0.4s" }}
        >
          {mode === "text" ? (
            <>
              <span>영문 대소문자</span>
              <span>·</span>
              <span>숫자 · 특수문자</span>
              <span>·</span>
              <span>{FONTS.length}가지 폰트</span>
            </>
          ) : (
            <>
              <span>이미지 → ASCII 변환</span>
              <span>·</span>
              <span>너비 조절 가능</span>
              <span>·</span>
              <span>밝기 반전 지원</span>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
