"use client";

import { RARITY_CONFIG, type Fortune } from "../data/fortunes";
import StatBar from "./StatBar";

interface GachaCardProps {
  fortune: Fortune;
}

export default function GachaCard({ fortune }: GachaCardProps) {
  const config = RARITY_CONFIG[fortune.rarity];

  return (
    <div className={`card-reveal rarity-${fortune.rarity} mx-auto w-full max-w-md rounded-2xl border ${config.border} ${config.bg} backdrop-blur-sm`}>
      {/* Header */}
      <div className="relative overflow-hidden rounded-t-2xl border-b border-white/5 px-6 pt-6 pb-4">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-white/10 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-white/10 rounded-tr-2xl" />

        {/* Rarity badge */}
        <div className="mb-3 flex items-center justify-between">
          <span className={`rounded-lg border ${config.border} bg-black/30 px-3 py-1 font-mono text-xs font-bold tracking-wider ${config.color}`}>
            {config.label}
          </span>
          <span className="font-mono text-[10px] text-zinc-600">
            {new Date().toLocaleDateString("ko-KR")}
          </span>
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold ${config.textColor}`}>
          {fortune.title}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">{fortune.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="space-y-3 px-6 py-5">
        {fortune.stats.map((stat, i) => (
          <StatBar
            key={stat.label}
            stat={stat}
            rarity={fortune.rarity}
            delay={0.8 + i * 0.15}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Message */}
      <div className="space-y-4 px-6 py-5">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            오늘의 메시지
          </p>
          <p className="text-sm leading-relaxed text-zinc-300">
            &ldquo;{fortune.message}&rdquo;
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              조언
            </p>
            <p className="text-xs leading-relaxed text-zinc-400">
              {fortune.advice}
            </p>
          </div>
          <div className="shrink-0">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              행운 아이템
            </p>
            <p className="text-xs text-zinc-400">{fortune.luckyItem}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-b-2xl border-t border-white/5 bg-black/20 px-6 py-3">
        <p className="text-center font-mono text-[10px] text-zinc-600">
          ✦ 매일 자정에 새로운 운세가 갱신됩니다 ✦
        </p>
      </div>
    </div>
  );
}
