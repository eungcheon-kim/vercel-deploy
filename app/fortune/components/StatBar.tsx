"use client";

import { RARITY_CONFIG, type Rarity, type Stat } from "../data/fortunes";

interface StatBarProps {
  stat: Stat;
  rarity: Rarity;
  delay: number;
}

export default function StatBar({ stat, rarity, delay }: StatBarProps) {
  const config = RARITY_CONFIG[rarity];

  return (
    <div
      className="anim-fade-up flex items-center gap-3"
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="w-5 text-center text-base">{stat.icon}</span>
      <span className="w-28 shrink-0 font-mono text-xs text-zinc-400">
        {stat.label}
      </span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <div
          className={`stat-bar-fill h-full rounded-full bg-gradient-to-r ${config.barColor}`}
          style={{
            width: `${stat.value}%`,
            animationDelay: `${delay + 0.2}s`,
            animationFillMode: "backwards",
          }}
        />
      </div>
      <span className={`w-8 text-right font-mono text-xs font-bold ${config.textColor}`}>
        {stat.value}
      </span>
    </div>
  );
}
