"use client";

import { useState, useCallback } from "react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function TreeNode({
  label,
  value,
  depth,
  defaultOpen,
}: {
  label: string;
  value: JsonValue;
  depth: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (value === null) {
    return (
      <div style={{ paddingLeft: depth * 16 }} className="flex items-center gap-1 py-0.5">
        <span className="text-zinc-500">{label}:</span>
        <span className="text-orange-400 italic">null</span>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div style={{ paddingLeft: depth * 16 }} className="flex items-center gap-1 py-0.5">
        <span className="text-zinc-500">{label}:</span>
        <span className="text-yellow-400">{String(value)}</span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div style={{ paddingLeft: depth * 16 }} className="flex items-center gap-1 py-0.5">
        <span className="text-zinc-500">{label}:</span>
        <span className="text-emerald-400">{value}</span>
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div style={{ paddingLeft: depth * 16 }} className="flex items-center gap-1 py-0.5">
        <span className="text-zinc-500">{label}:</span>
        <span className="text-sky-400">&quot;{value}&quot;</span>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? value.map((v, i) => [String(i), v] as const)
    : Object.entries(value);
  const bracket = isArray ? ["[", "]"] : ["{", "}"];

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 py-0.5 text-left hover:bg-white/5 rounded px-1 -ml-1 transition-colors"
      >
        <span className="w-4 text-center text-zinc-600 text-xs select-none">
          {open ? "▼" : "▶"}
        </span>
        <span className="text-zinc-500">{label}:</span>
        <span className="text-zinc-600 text-xs">
          {bracket[0]}
          {!open && (
            <span className="text-zinc-600">
              {" "}{entries.length} {isArray ? "items" : "keys"}{" "}
            </span>
          )}
          {!open && bracket[1]}
        </span>
      </button>
      {open && (
        <>
          {entries.map(([k, v]) => (
            <TreeNode
              key={k}
              label={k}
              value={v as JsonValue}
              depth={depth + 1}
              defaultOpen={depth < 1}
            />
          ))}
          <div style={{ paddingLeft: 4 }} className="text-zinc-600 text-xs">
            {bracket[1]}
          </div>
        </>
      )}
    </div>
  );
}

function getErrorLine(input: string, error: SyntaxError): number | null {
  const posMatch = error.message.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const lines = input.substring(0, pos).split("\n");
    return lines.length;
  }

  const colMatch = error.message.match(/column\s+(\d+)\s.*?line\s+(\d+)/i);
  if (colMatch) return Number(colMatch[2]);

  const lineMatch = error.message.match(/line\s+(\d+)/i);
  if (lineMatch) return Number(lineMatch[1]);

  let braceDepth = 0;
  let bracketDepth = 0;
  let inString = false;
  let line = 1;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "\n") line++;
    if (ch === '"' && (i === 0 || input[i - 1] !== "\\")) inString = !inString;
    if (!inString) {
      if (ch === "{") braceDepth++;
      else if (ch === "}") braceDepth--;
      else if (ch === "[") bracketDepth++;
      else if (ch === "]") bracketDepth--;
    }
  }
  return line;
}

const SAMPLE = `{
  "name": "Dev Playground",
  "version": "1.0.0",
  "features": ["JSON 포매터", "트리뷰", "압축"],
  "author": {
    "name": "개발자",
    "github": "https://github.com"
  },
  "isAwesome": true,
  "stars": 42
}`;

export default function JsonFormatterPage() {
  const [input, setInput] = useState(SAMPLE);
  const [formatted, setFormatted] = useState("");
  const [parsed, setParsed] = useState<JsonValue | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [treeView, setTreeView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const format = useCallback(() => {
    try {
      const obj = JSON.parse(input);
      const result = JSON.stringify(obj, null, indent);
      setFormatted(result);
      setParsed(obj);
      setError(null);
    } catch (e) {
      const se = e as SyntaxError;
      const line = getErrorLine(input, se);
      const lineInfo = line ? ` (${line}번째 줄 근처)` : "";
      setError(`JSON 파싱 오류${lineInfo}: ${se.message}`);
      setFormatted("");
      setParsed(undefined);
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    try {
      const obj = JSON.parse(input);
      const result = JSON.stringify(obj);
      setFormatted(result);
      setParsed(obj);
      setError(null);
    } catch (e) {
      const se = e as SyntaxError;
      const line = getErrorLine(input, se);
      const lineInfo = line ? ` (${line}번째 줄 근처)` : "";
      setError(`JSON 파싱 오류${lineInfo}: ${se.message}`);
      setFormatted("");
      setParsed(undefined);
    }
  }, [input]);

  const copy = useCallback(async () => {
    if (!formatted) return;
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [formatted]);

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-4 pt-16 pb-24 sm:px-6">
        {/* Title */}
        <div className="anim-fade-up mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              JSON 포매터
            </span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            JSON을 포맷하고, 트리뷰로 보고, 복사하고, 압축하세요
          </p>
        </div>

        {/* Toolbar */}
        <div
          className="anim-fade-up mb-4 flex w-full max-w-6xl flex-wrap items-center gap-2"
          style={{ animationDelay: "0.1s" }}
        >
          <button
            onClick={format}
            className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 font-mono text-sm text-sky-400 transition-all hover:bg-sky-500/20 hover:border-sky-500/50 active:scale-95"
          >
            ✨ 포맷
          </button>
          <button
            onClick={minify}
            className="rounded-lg border border-card-border bg-card-bg px-4 py-2 font-mono text-sm text-zinc-400 transition-all hover:bg-white/5 hover:text-zinc-300 active:scale-95"
          >
            🗜 압축
          </button>
          <button
            onClick={copy}
            disabled={!formatted}
            className="rounded-lg border border-card-border bg-card-bg px-4 py-2 font-mono text-sm text-zinc-400 transition-all hover:bg-white/5 hover:text-zinc-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copied ? "✅ 복사됨!" : "📋 복사"}
          </button>

          <div className="mx-1 h-6 w-px bg-card-border hidden sm:block" />

          <button
            onClick={() => setTreeView(!treeView)}
            className={`rounded-lg border px-4 py-2 font-mono text-sm transition-all active:scale-95 ${
              treeView
                ? "border-accent/30 bg-accent/10 text-accent-2"
                : "border-card-border bg-card-bg text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
            }`}
          >
            🌳 트리뷰
          </button>

          <div className="mx-1 h-6 w-px bg-card-border hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-zinc-600">들여쓰기</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`rounded-md border px-2 py-1 font-mono text-xs transition-all ${
                  indent === n
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                    : "border-card-border bg-card-bg text-zinc-500 hover:text-zinc-400"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 w-full max-w-6xl rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 font-mono text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Panels */}
        <div
          className="anim-fade-up grid w-full max-w-6xl gap-4 flex-1 grid-cols-1 md:grid-cols-2"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Input */}
          <div className="flex flex-col rounded-xl border border-card-border bg-card-bg/80 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-card-border px-4 py-2.5">
              <span className="font-mono text-xs text-zinc-500">입력</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setInput("");
                    setFormatted("");
                    setParsed(undefined);
                    setError(null);
                  }}
                  className="font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                >
                  지우기
                </button>
                <button
                  onClick={() => {
                    setInput(SAMPLE);
                    setError(null);
                  }}
                  className="font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                >
                  예시
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  format();
                }
              }}
              placeholder='{"key": "value"}'
              spellCheck={false}
              className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-zinc-300 placeholder:text-zinc-700 outline-none min-h-[300px] md:min-h-[500px]"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col rounded-xl border border-card-border bg-card-bg/80 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-card-border px-4 py-2.5">
              <span className="font-mono text-xs text-zinc-500">
                {treeView ? "트리뷰" : "결과"}
              </span>
              {formatted && (
                <span className="font-mono text-xs text-zinc-600">
                  {formatted.length.toLocaleString()} chars
                </span>
              )}
            </div>

            {!formatted && !error ? (
              <div className="flex flex-1 items-center justify-center min-h-[300px] md:min-h-[500px]">
                <p className="font-mono text-sm text-zinc-700">
                  왼쪽에 JSON을 입력하고 &quot;포맷&quot; 버튼을 누르세요
                  <br />
                  <span className="text-zinc-600 text-xs">
                    또는 Ctrl/⌘ + Enter
                  </span>
                </p>
              </div>
            ) : treeView && parsed !== undefined ? (
              <div className="flex-1 overflow-auto p-4 font-mono text-sm min-h-[300px] md:min-h-[500px] scrollbar-none">
                <TreeNode
                  label="root"
                  value={parsed}
                  depth={0}
                  defaultOpen={true}
                />
              </div>
            ) : (
              <pre className="flex-1 overflow-auto p-4 font-mono text-sm text-emerald-400/90 min-h-[300px] md:min-h-[500px] scrollbar-none whitespace-pre-wrap break-all">
                {formatted}
              </pre>
            )}
          </div>
        </div>

        {/* Shortcut hint */}
        <div
          className="anim-fade-up mt-4 flex items-center gap-3 font-mono text-[10px] text-zinc-700"
          style={{ animationDelay: "0.4s" }}
        >
          <span>⌘/Ctrl + Enter → 포맷</span>
          <span>·</span>
          <span>트리뷰로 JSON 구조 탐색</span>
        </div>
      </main>
    </div>
  );
}
