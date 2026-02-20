"use client";

import { useState, useMemo, useCallback } from "react";

interface MatchResult {
  full: string;
  index: number;
  groups: string[];
}

const PRESETS = [
  { label: "이메일", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { label: "URL", pattern: "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+", flags: "g" },
  { label: "전화번호", pattern: "0\\d{1,2}-\\d{3,4}-\\d{4}", flags: "g" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { label: "HTML 태그", pattern: "<\\/?[a-z][\\w-]*(?:\\s[^>]*)?\\/?>", flags: "gi" },
  { label: "한글", pattern: "[가-힣]+", flags: "g" },
  { label: "날짜 (YYYY-MM-DD)", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])", flags: "g" },
  { label: "16진수 색상", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", flags: "g" },
];

const HIGHLIGHT_COLORS = [
  { bg: "rgba(139,92,246,0.3)", border: "rgba(139,92,246,0.6)" },
  { bg: "rgba(236,72,153,0.3)", border: "rgba(236,72,153,0.6)" },
  { bg: "rgba(34,197,94,0.3)", border: "rgba(34,197,94,0.6)" },
  { bg: "rgba(251,191,36,0.3)", border: "rgba(251,191,36,0.6)" },
  { bg: "rgba(59,130,246,0.3)", border: "rgba(59,130,246,0.6)" },
  { bg: "rgba(244,63,94,0.3)", border: "rgba(244,63,94,0.6)" },
];

export default function RegexPage() {
  const [pattern, setPattern] = useState("");
  const [flagG, setFlagG] = useState(true);
  const [flagI, setFlagI] = useState(false);
  const [flagM, setFlagM] = useState(false);
  const [flagS, setFlagS] = useState(false);
  const [testString, setTestString] = useState("");

  const flags = useMemo(() => {
    let f = "";
    if (flagG) f += "g";
    if (flagI) f += "i";
    if (flagM) f += "m";
    if (flagS) f += "s";
    return f;
  }, [flagG, flagI, flagM, flagS]);

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: null };
    try {
      const r = new RegExp(pattern, flags);
      return { regex: r, error: null };
    } catch (e) {
      return { regex: null, error: (e as Error).message };
    }
  }, [pattern, flags]);

  const matches: MatchResult[] = useMemo(() => {
    if (!regex || !testString) return [];
    const results: MatchResult[] = [];
    if (flags.includes("g")) {
      let m: RegExpExecArray | null;
      const r = new RegExp(regex.source, regex.flags);
      while ((m = r.exec(testString)) !== null) {
        results.push({
          full: m[0],
          index: m.index,
          groups: m.slice(1),
        });
        if (m[0].length === 0) r.lastIndex++;
      }
    } else {
      const m = regex.exec(testString);
      if (m) {
        results.push({
          full: m[0],
          index: m.index,
          groups: m.slice(1),
        });
      }
    }
    return results;
  }, [regex, testString, flags]);

  const highlightedParts = useMemo(() => {
    if (!matches.length || !testString) return null;

    const parts: { text: string; matchIdx: number | null }[] = [];
    let lastEnd = 0;

    const sorted = [...matches].sort((a, b) => a.index - b.index);
    sorted.forEach((m, i) => {
      if (m.index > lastEnd) {
        parts.push({ text: testString.slice(lastEnd, m.index), matchIdx: null });
      }
      parts.push({ text: m.full, matchIdx: i });
      lastEnd = m.index + m.full.length;
    });

    if (lastEnd < testString.length) {
      parts.push({ text: testString.slice(lastEnd), matchIdx: null });
    }

    return parts;
  }, [matches, testString]);

  const applyPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setPattern(preset.pattern);
    setFlagG(preset.flags.includes("g"));
    setFlagI(preset.flags.includes("i"));
    setFlagM(preset.flags.includes("m"));
    setFlagS(preset.flags.includes("s"));
  }, []);

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-4 pt-16 pb-24 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              정규식 테스터
            </span>
            <span className="ml-2">🔍</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            정규식 패턴을 입력하고 실시간으로 매칭 결과를 확인하세요
          </p>
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-4">
          {/* Pattern input */}
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              정규식 패턴
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-card-border bg-zinc-900/60 px-3 py-2 font-mono text-sm">
              <span className="select-none text-zinc-600">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="패턴을 입력하세요"
                className="min-w-0 flex-1 bg-transparent text-zinc-200 outline-none placeholder:text-zinc-700"
                spellCheck={false}
              />
              <span className="select-none text-zinc-600">/</span>
              <span className="select-none text-accent-2">{flags}</span>
            </div>

            {/* Flags */}
            <div className="mt-3 flex flex-wrap gap-3">
              {([
                ["g", "global", flagG, setFlagG],
                ["i", "ignoreCase", flagI, setFlagI],
                ["m", "multiline", flagM, setFlagM],
                ["s", "dotAll", flagS, setFlagS],
              ] as const).map(([flag, label, value, setter]) => (
                <label
                  key={flag}
                  className="flex cursor-pointer items-center gap-1.5 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 accent-accent"
                  />
                  <span className="font-bold text-accent-2">{flag}</span>
                  <span className="text-zinc-600">({label})</span>
                </label>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              자주 쓰는 패턴
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="rounded-lg border border-card-border bg-zinc-900/40 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent-2"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test string */}
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              테스트 문자열
            </label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder={"여기에 테스트할 문자열을 입력하세요...\n여러 줄도 가능합니다."}
              rows={5}
              className="w-full resize-y rounded-lg border border-card-border bg-zinc-900/60 px-3 py-2.5 font-mono text-sm leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-700 focus:border-accent/40"
              spellCheck={false}
            />
          </div>

          {/* Highlighted result */}
          {testString && pattern && !error && (
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                매칭 하이라이트
              </label>
              <div className="whitespace-pre-wrap break-all rounded-lg border border-card-border bg-zinc-900/60 px-3 py-2.5 font-mono text-sm leading-relaxed text-zinc-300">
                {highlightedParts ? (
                  highlightedParts.map((part, i) =>
                    part.matchIdx !== null ? (
                      <mark
                        key={i}
                        style={{
                          backgroundColor: HIGHLIGHT_COLORS[part.matchIdx % HIGHLIGHT_COLORS.length].bg,
                          borderBottom: `2px solid ${HIGHLIGHT_COLORS[part.matchIdx % HIGHLIGHT_COLORS.length].border}`,
                          borderRadius: "2px",
                          padding: "0 1px",
                          color: "inherit",
                        }}
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    )
                  )
                ) : (
                  <span className="text-zinc-600">매칭 결과 없음</span>
                )}
              </div>
            </div>
          )}

          {/* Match summary */}
          {testString && pattern && !error && (
            <div className="rounded-xl border border-card-border bg-card-bg p-4">
              <label className="mb-3 block font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                매칭 결과
              </label>

              <div className="mb-3 flex gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-card-border bg-zinc-900/40 px-3 py-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">매치 수</span>
                  <span className="font-mono text-lg font-bold text-accent-2">{matches.length}</span>
                </div>
              </div>

              {matches.length > 0 && (
                <div className="max-h-64 overflow-y-auto scrollbar-none">
                  <table className="w-full border-collapse font-mono text-xs">
                    <thead>
                      <tr className="text-left text-zinc-600">
                        <th className="border-b border-card-border px-2 py-1.5">#</th>
                        <th className="border-b border-card-border px-2 py-1.5">매치</th>
                        <th className="border-b border-card-border px-2 py-1.5">인덱스</th>
                        {matches.some((m) => m.groups.length > 0) && (
                          <th className="border-b border-card-border px-2 py-1.5">캡처 그룹</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((m, i) => (
                        <tr key={i} className="transition-colors hover:bg-white/2">
                          <td className="border-b border-card-border/50 px-2 py-1.5 text-zinc-600">{i + 1}</td>
                          <td className="border-b border-card-border/50 px-2 py-1.5">
                            <span
                              className="inline-block rounded px-1.5 py-0.5"
                              style={{
                                backgroundColor: HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length].bg,
                                borderLeft: `3px solid ${HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length].border}`,
                              }}
                            >
                              {m.full || <span className="text-zinc-600">(empty)</span>}
                            </span>
                          </td>
                          <td className="border-b border-card-border/50 px-2 py-1.5 text-zinc-500">{m.index}</td>
                          {matches.some((m) => m.groups.length > 0) && (
                            <td className="border-b border-card-border/50 px-2 py-1.5">
                              {m.groups.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {m.groups.map((g, gi) => (
                                    <span
                                      key={gi}
                                      className="rounded border border-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 text-zinc-400"
                                    >
                                      ${gi + 1}: {g ?? "undefined"}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-zinc-700">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {matches.length === 0 && (
                <p className="font-mono text-xs text-zinc-600">매칭되는 결과가 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
