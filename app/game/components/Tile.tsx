"use client";

import type { TileData } from "../lib/gameLogic";

// Tile colors by value - neon/cyberpunk dark theme
const TILE_STYLES: Record<number, { bg: string; text: string; shadow: string; fontSize?: string }> = {
  2:    { bg: "bg-zinc-800",        text: "text-zinc-300",   shadow: "" },
  4:    { bg: "bg-zinc-700",        text: "text-zinc-200",   shadow: "" },
  8:    { bg: "bg-orange-900/80",   text: "text-orange-200", shadow: "shadow-[0_0_15px_rgba(251,146,60,0.2)]" },
  16:   { bg: "bg-orange-800/80",   text: "text-orange-100", shadow: "shadow-[0_0_20px_rgba(251,146,60,0.3)]" },
  32:   { bg: "bg-red-900/80",      text: "text-red-100",    shadow: "shadow-[0_0_20px_rgba(248,113,113,0.3)]" },
  64:   { bg: "bg-red-800/80",      text: "text-red-50",     shadow: "shadow-[0_0_25px_rgba(248,113,113,0.4)]" },
  128:  { bg: "bg-yellow-800/80",   text: "text-yellow-100", shadow: "shadow-[0_0_25px_rgba(250,204,21,0.3)]", fontSize: "text-2xl" },
  256:  { bg: "bg-yellow-700/80",   text: "text-yellow-50",  shadow: "shadow-[0_0_30px_rgba(250,204,21,0.4)]", fontSize: "text-2xl" },
  512:  { bg: "bg-purple-800/80",   text: "text-purple-100", shadow: "shadow-[0_0_30px_rgba(168,85,247,0.4)]", fontSize: "text-2xl" },
  1024: { bg: "bg-purple-700/80",   text: "text-purple-50",  shadow: "shadow-[0_0_35px_rgba(168,85,247,0.5)]", fontSize: "text-xl" },
  2048: { bg: "bg-gradient-to-br from-yellow-500 to-amber-600", text: "text-white", shadow: "shadow-[0_0_50px_rgba(251,191,36,0.6)]", fontSize: "text-xl" },
};

function getStyle(value: number) {
  if (TILE_STYLES[value]) return TILE_STYLES[value];
  // Super tiles (4096+)
  return {
    bg: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    text: "text-white",
    shadow: "shadow-[0_0_60px_rgba(236,72,153,0.6)]",
    fontSize: "text-lg",
  };
}

interface TileProps {
  tile: TileData;
  cellSize: number;
  gap: number;
  offsetX: number;
  offsetY: number;
}

export default function Tile({ tile, cellSize, gap, offsetX, offsetY }: TileProps) {
  const style = getStyle(tile.value);
  const fontSize = style.fontSize || (tile.value >= 100 ? "text-2xl" : "text-3xl");

  // Position: offset + col * (cellSize + gap)
  const x = offsetX + tile.col * (cellSize + gap);
  const y = offsetY + tile.row * (cellSize + gap);

  // Animation class
  let animClass = "";
  if (tile.isNew) {
    animClass = "animate-tile-pop";
  } else if (tile.mergedFrom) {
    animClass = "animate-tile-merge";
  }

  return (
    <div
      className={`absolute z-10 flex items-center justify-center rounded-xl font-bold transition-all duration-150 ease-in-out ${style.bg} ${style.text} ${style.shadow} ${fontSize} ${animClass}`}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {tile.value}
    </div>
  );
}
