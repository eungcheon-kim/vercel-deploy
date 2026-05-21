"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUUID } from "@/app/lib/user";

export default function PollForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const submit = async () => {
    setError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("제목을 입력하세요");
      return;
    }

    const validOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (validOptions.length < 2) {
      setError("유효한 선택지 2개 이상 필요");
      return;
    }

    setLoading(true);
    try {
      const uuid = getUUID();
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim(),
          options: validOptions,
          multipleChoice,
          uuid,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다");
        return;
      }
      router.push(`/vote/${data.id}`);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="block font-mono text-xs text-zinc-400">
          제목 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="투표 제목을 입력하세요"
          className="w-full rounded-xl border border-card-border bg-card-bg/80 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none backdrop-blur-sm transition-all focus:border-violet-500/50"
        />
        <span className="block text-right font-mono text-[10px] text-zinc-700">
          {title.length}/100
        </span>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block font-mono text-xs text-zinc-400">
          설명 <span className="text-zinc-600">(선택, 마크다운 지원)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="설명이나 링크를 추가하세요 (예: [참고 링크](https://...))"
          className="w-full resize-none rounded-xl border border-card-border bg-card-bg/80 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none backdrop-blur-sm transition-all focus:border-violet-500/50"
        />
        <span className="block text-right font-mono text-[10px] text-zinc-700">
          {description.length}/500
        </span>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="block font-mono text-xs text-zinc-400">
          선택지 <span className="text-red-400">*</span>
          <span className="ml-2 text-zinc-600">({options.length}/10)</span>
        </label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center font-mono text-[11px] text-zinc-600">
                {i + 1}
              </span>
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                maxLength={80}
                placeholder={`선택지 ${i + 1}`}
                className="flex-1 rounded-lg border border-card-border bg-card-bg/60 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="shrink-0 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 10 && (
          <button
            onClick={addOption}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-card-border py-2.5 font-mono text-xs text-zinc-500 transition-all hover:border-violet-500/40 hover:text-violet-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            선택지 추가
          </button>
        )}
      </div>

      {/* Multiple Choice Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-card-border bg-card-bg/60 px-4 py-3">
        <div>
          <span className="text-sm text-zinc-200">복수 선택 허용</span>
          <p className="font-mono text-[10px] text-zinc-600">여러 개를 동시에 선택 가능</p>
        </div>
        <button
          onClick={() => setMultipleChoice(!multipleChoice)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            multipleChoice ? "bg-violet-500" : "bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              multipleChoice ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center font-mono text-xs text-red-400">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 py-3.5 font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "생성 중..." : "투표 만들기"}
      </button>
    </div>
  );
}
