---
name: add-minigame
description: Dev Playground에 새 미니게임을 추가하는 워크플로우. 새 게임 추가, 미니게임 만들기, 게임 구현 요청 시 사용.
---

# 미니게임 추가 워크플로우

## 새 게임 추가 시 따라야 할 단계

### Step 1: 게임 폴더 생성

```
app/[game-name]/
  page.tsx                 # 메타데이터 + 레이아웃
  components/[Game].tsx    # 메인 게임 컴포넌트
  lib/                     # (선택) 게임 로직 분리
```

### Step 2: 페이지 템플릿

```tsx
// app/[game-name]/page.tsx
import MyGame from "./components/MyGame";

export const metadata = {
  title: "게임이름 | Dev Playground",
  description: "게임 설명",
};

export default function GamePage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-xxx-400 to-yyy-400 bg-clip-text text-transparent">
              게임이름
            </span>
          </h2>
        </div>
        <MyGame />
      </main>
    </div>
  );
}
```

### Step 3: 게임 컴포넌트 필수 요소

- `"use client"` 선언
- ScoreBoard 연동 (`show`, `onClose` props)
- 모바일 터치 대응 (`touchAction: "none"`, `preventDefault`)
- 키보드 컨트롤 (`useEffect` + `keydown`)
- Best score `localStorage` 저장

### Step 4: 4곳에 게임 등록

1. **`app/lib/redis.ts`** — `GAME_CONFIG`에 추가:
   ```ts
   "game-id": { label: "게임이름", unit: "점", direction: "desc" },
   ```

2. **`app/components/NavBar.tsx`** — `GAMES` 배열:
   ```ts
   { href: "/game-name", label: "라벨", emoji: "🎮" },
   ```

3. **`app/page.tsx`** — `APPS` 배열에 카드 추가

4. **`app/ranking/page.tsx`** — `GAMES` 배열에 추가

### Step 5: 빌드 확인

```bash
npx next build
```

## 점수 방향 참고

| direction | 의미 | 예시 |
|-----------|------|------|
| `desc` | 높을수록 좋음 | 2048, 플래피, 스네이크 |
| `asc` | 낮을수록 좋음 | 반응속도(ms), 지뢰찾기(초) |

`asc` 게임은 Redis에 음수로 저장되므로 API가 자동 처리.
