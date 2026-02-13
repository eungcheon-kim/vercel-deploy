// Random nickname generator for first-time users

const ADJECTIVES = [
  "빠른", "용감한", "귀여운", "멋진", "조용한", "신비한", "날쌘", "똑똑한",
  "엉뚱한", "활발한", "느긋한", "대담한", "수줍은", "유쾌한", "진지한", "슬기로운",
  "재빠른", "힙한", "쿨한", "센스있는", "당당한", "소심한", "열정의", "냉철한",
];

const NOUNS = [
  "개발자", "코더", "해커", "디자이너", "펭귄", "고양이", "강아지", "토끼",
  "판다", "여우", "늑대", "독수리", "고래", "돌고래", "사자", "호랑이",
  "용", "유니콘", "로봇", "닌자", "기사", "마법사", "탐험가", "우주인",
];

export function generateRandomNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

const UUID_KEY = "dev-playground-uuid";
const NICKNAME_KEY = "dev-playground-nickname";

export function getOrCreateUser(): { uuid: string; nickname: string } {
  if (typeof window === "undefined") return { uuid: "", nickname: "" };

  let uuid = localStorage.getItem(UUID_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(UUID_KEY, uuid);
  }

  let nickname = localStorage.getItem(NICKNAME_KEY);
  if (!nickname) {
    nickname = generateRandomNickname();
    localStorage.setItem(NICKNAME_KEY, nickname);
  }

  return { uuid, nickname };
}

export function getNickname(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NICKNAME_KEY) || "";
}

export function setNickname(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NICKNAME_KEY, name.trim().substring(0, 20));
}

export function getUUID(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(UUID_KEY) || "";
}

export { UUID_KEY, NICKNAME_KEY };
