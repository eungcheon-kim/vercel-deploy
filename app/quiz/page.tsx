"use client";

import { useState, useCallback, useMemo } from "react";

/* ── 퀴즈 타입 ── */

interface Quiz {
  code: string;
  options: string[];
  answer: number;
  explanation: string;
  topic: string;
}

/* ── 퀴즈 데이터 ── */

const QUIZZES: Quiz[] = [
  {
    topic: "호이스팅",
    code: `console.log(a);
var a = 10;`,
    options: ["10", "undefined", "ReferenceError", "null"],
    answer: 1,
    explanation:
      "var 선언은 호이스팅되어 함수/전역 스코프 최상단으로 끌어올려지지만, 할당은 제자리에 남습니다. 따라서 선언만 올라가고 값은 undefined입니다.",
  },
  {
    topic: "호이스팅",
    code: `console.log(b);
let b = 20;`,
    options: ["20", "undefined", "ReferenceError", "null"],
    answer: 2,
    explanation:
      "let/const도 호이스팅되지만 TDZ(Temporal Dead Zone)에 의해 선언 전 접근 시 ReferenceError가 발생합니다.",
  },
  {
    topic: "클로저",
    code: `function make() {
  let count = 0;
  return () => ++count;
}
const fn = make();
console.log(fn(), fn(), fn());`,
    options: ["1 1 1", "0 1 2", "1 2 3", "NaN NaN NaN"],
    answer: 2,
    explanation:
      "클로저는 외부 함수의 변수를 참조하는 내부 함수입니다. count 변수가 make의 렉시컬 환경에 유지되어 호출할 때마다 1씩 증가합니다.",
  },
  {
    topic: "클로저",
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    options: ["0 1 2", "3 3 3", "0 0 0", "undefined undefined undefined"],
    answer: 1,
    explanation:
      "var는 함수 스코프이므로 루프가 끝난 뒤 i=3인 상태로 콜백이 실행됩니다. let을 사용하면 블록 스코프로 0, 1, 2가 출력됩니다.",
  },
  {
    topic: "this 바인딩",
    code: `const obj = {
  name: "JS",
  greet: () => {
    console.log(this.name);
  },
};
obj.greet();`,
    options: ['"JS"', "undefined", "TypeError", '""'],
    answer: 1,
    explanation:
      "화살표 함수는 자신만의 this를 갖지 않고 상위 스코프의 this를 그대로 사용합니다. 모듈/전역에서 this.name은 undefined입니다.",
  },
  {
    topic: "this 바인딩",
    code: `function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function() {
  return this.name;
};
const d = new Dog("Max");
const fn = d.bark;
console.log(fn());`,
    options: ['"Max"', "undefined", "TypeError", "null"],
    answer: 1,
    explanation:
      "fn에 메서드를 할당하면 this 바인딩이 사라집니다. 일반 함수 호출 시 this는 전역(strict mode에서는 undefined)을 가리킵니다.",
  },
  {
    topic: "Promise",
    code: `console.log("A");
Promise.resolve().then(() => console.log("B"));
console.log("C");`,
    options: ['"A" "B" "C"', '"A" "C" "B"', '"B" "A" "C"', '"C" "A" "B"'],
    answer: 1,
    explanation:
      "Promise.then 콜백은 마이크로태스크 큐에 들어갑니다. 동기 코드(A, C)가 먼저 실행된 뒤 마이크로태스크(B)가 실행됩니다.",
  },
  {
    topic: "async/await",
    code: `async function foo() {
  console.log("1");
  await Promise.resolve();
  console.log("2");
}
console.log("3");
foo();
console.log("4");`,
    options: ['"3" "1" "4" "2"', '"3" "1" "2" "4"', '"1" "2" "3" "4"', '"3" "4" "1" "2"'],
    answer: 0,
    explanation:
      '"3" 출력 → foo() 호출 → "1" 출력 → await에서 중단 → "4" 출력 → 마이크로태스크로 "2" 출력. await 이후 코드는 마이크로태스크로 실행됩니다.',
  },
  {
    topic: "== vs ===",
    code: `console.log(0 == "0");
console.log(0 == []);
console.log("0" == []);`,
    options: [
      "true true true",
      "true true false",
      "true false false",
      "false false false",
    ],
    answer: 1,
    explanation:
      '0 == "0" → 문자열이 숫자로 변환되어 true. 0 == [] → []가 ""로, 다시 0으로 변환되어 true. "0" == [] → []가 ""로 변환되고 "0" != "" 이므로 false.',
  },
  {
    topic: "== vs ===",
    code: `console.log(null == undefined);
console.log(null === undefined);
console.log(null == 0);`,
    options: [
      "true false false",
      "true true false",
      "false false false",
      "true false true",
    ],
    answer: 0,
    explanation:
      "null == undefined은 스펙에 의해 true입니다. 하지만 ===는 타입이 다르므로 false. null == 0은 null의 특별 규칙에 의해 false입니다.",
  },
  {
    topic: "배열 메서드",
    code: `const arr = [1, 2, 3, 4, 5];
const result = arr.filter(x => x > 2)
               .map(x => x * 2);
console.log(result);`,
    options: ["[6, 8, 10]", "[2, 4, 6, 8, 10]", "[3, 4, 5]", "[6, 8]"],
    answer: 0,
    explanation:
      "filter(x => x > 2)는 [3, 4, 5]를 반환하고, map(x => x * 2)로 각 요소를 2배 하면 [6, 8, 10]이 됩니다.",
  },
  {
    topic: "배열 메서드",
    code: `const arr = [1, 2, 3];
const sum = arr.reduce((acc, cur) => {
  return acc + cur;
});
console.log(sum);`,
    options: ["6", "NaN", "[1, 2, 3]", "0"],
    answer: 0,
    explanation:
      "reduce에 초기값이 없으면 첫 번째 요소(1)가 초기값이 됩니다. 1+2=3, 3+3=6으로 최종 결과는 6입니다.",
  },
  {
    topic: "스프레드/디스트럭처링",
    code: `const a = { x: 1, y: 2 };
const b = { y: 3, z: 4 };
const c = { ...a, ...b };
console.log(c);`,
    options: [
      "{ x: 1, y: 3, z: 4 }",
      "{ x: 1, y: 2, z: 4 }",
      "{ x: 1, y: 2, y: 3, z: 4 }",
      "TypeError",
    ],
    answer: 0,
    explanation:
      "스프레드 연산자로 객체를 병합할 때 같은 키가 있으면 나중에 오는 값이 덮어씁니다. b의 y: 3이 a의 y: 2를 덮어씁니다.",
  },
  {
    topic: "스프레드/디스트럭처링",
    code: `const [a, , b, ...rest] = [1, 2, 3, 4, 5];
console.log(a, b, rest);`,
    options: [
      "1 3 [4, 5]",
      "1 2 [3, 4, 5]",
      "1 3 [5]",
      "1 undefined [3, 4, 5]",
    ],
    answer: 0,
    explanation:
      "쉼표로 인덱스를 건너뛸 수 있습니다. a=1, 두 번째(2)는 건너뛰고, b=3, 나머지 rest=[4, 5]가 됩니다.",
  },
  {
    topic: "typeof",
    code: `console.log(typeof null);
console.log(typeof undefined);
console.log(typeof NaN);`,
    options: [
      '"object" "undefined" "number"',
      '"null" "undefined" "NaN"',
      '"object" "undefined" "NaN"',
      '"null" "undefined" "number"',
    ],
    answer: 0,
    explanation:
      'typeof null === "object"는 JS 초기 구현의 버그이지만 호환성 때문에 유지됩니다. NaN은 숫자 타입의 특수 값이므로 typeof NaN === "number"입니다.',
  },
  {
    topic: "typeof / instanceof",
    code: `console.log(typeof []);
console.log([] instanceof Array);
console.log([] instanceof Object);`,
    options: [
      '"object" true true',
      '"array" true true',
      '"object" true false',
      '"array" true false',
    ],
    answer: 0,
    explanation:
      'typeof로는 배열과 일반 객체를 구분할 수 없습니다(둘 다 "object"). instanceof는 프로토타입 체인을 확인하므로 Array와 Object 모두 true입니다.',
  },
  {
    topic: "NaN 비교",
    code: `console.log(NaN === NaN);
console.log(NaN == NaN);
console.log(Number.isNaN(NaN));`,
    options: [
      "false false true",
      "true true true",
      "false true true",
      "false false false",
    ],
    answer: 0,
    explanation:
      "NaN은 자기 자신과도 같지 않은 유일한 값입니다(IEEE 754 명세). Number.isNaN()은 정확히 NaN인지 확인하는 올바른 방법입니다.",
  },
  {
    topic: "null/undefined",
    code: `console.log(Number(null));
console.log(Number(undefined));
console.log(Number(""));`,
    options: ["0 NaN 0", "0 0 0", "NaN NaN 0", "null undefined 0"],
    answer: 0,
    explanation:
      "Number(null) = 0, Number(undefined) = NaN, Number(\"\") = 0. null과 빈 문자열은 0으로 변환되지만 undefined는 NaN이 됩니다.",
  },
  {
    topic: "이벤트 루프",
    code: `setTimeout(() => console.log("A"), 0);
Promise.resolve().then(() => console.log("B"));
console.log("C");`,
    options: ['"C" "B" "A"', '"C" "A" "B"', '"A" "B" "C"', '"B" "C" "A"'],
    answer: 0,
    explanation:
      "동기 코드(C) → 마이크로태스크(Promise → B) → 매크로태스크(setTimeout → A) 순서로 실행됩니다. 마이크로태스크가 매크로태스크보다 우선합니다.",
  },
  {
    topic: "이벤트 루프",
    code: `setTimeout(() => console.log(1), 0);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => {
  console.log(3);
  Promise.resolve().then(() => console.log(4));
});
console.log(5);`,
    options: ["5 3 4 1 2", "5 1 2 3 4", "1 2 3 4 5", "5 3 1 4 2"],
    answer: 0,
    explanation:
      "동기(5) → 마이크로태스크(3, 이어서 4) → 매크로태스크(1, 2). 마이크로태스크 안에서 등록된 마이크로태스크도 매크로태스크보다 먼저 처리됩니다.",
  },
  {
    topic: "호이스팅",
    code: `sayHi();
function sayHi() {
  console.log("Hi!");
}
sayBye();
var sayBye = function() {
  console.log("Bye!");
};`,
    options: [
      '"Hi!" 후 TypeError',
      '"Hi!" "Bye!"',
      "ReferenceError",
      "TypeError 후 TypeError",
    ],
    answer: 0,
    explanation:
      "함수 선언문(function sayHi)은 전체가 호이스팅되어 호출 가능합니다. 하지만 함수 표현식(var sayBye)은 변수만 호이스팅되어 undefined이므로 호출 시 TypeError가 발생합니다.",
  },
  {
    topic: "타입 변환",
    code: `console.log([] + []);
console.log([] + {});
console.log({} + []);`,
    options: [
      '"" "[object Object]" "[object Object]"',
      '"" "[object Object]" 0',
      '"undefined" "NaN" "NaN"',
      '"[]" "[object Object]" "[object Object]"',
    ],
    answer: 0,
    explanation:
      '[] + [] → 둘 다 빈 문자열로 변환되어 "". [] + {} → "" + "[object Object]". {} + [] → 표현식 위치에서는 "[object Object]"가 됩니다(콘솔에서는 블록으로 해석될 수 있음).',
  },
  {
    topic: "배열 메서드",
    code: `const arr = [10, 20, 30];
const result = arr.map(parseInt);
console.log(result);`,
    options: ["[10, 20, 30]", "[10, NaN, NaN]", "[10, NaN, 30]", "TypeError"],
    answer: 1,
    explanation:
      "map은 콜백에 (value, index, array)를 전달합니다. parseInt(10,0)=10, parseInt(20,1)=NaN(1진법 없음), parseInt(30,2)=NaN(2진법에 3 없음).",
  },
  {
    topic: "Promise",
    code: `const p = new Promise((resolve) => {
  resolve(1);
  resolve(2);
  console.log(3);
});
p.then(console.log);
console.log(4);`,
    options: ["3 4 1", "3 4 2", "4 3 1", "3 1 4"],
    answer: 0,
    explanation:
      "Promise 생성자 안 코드는 동기 실행됩니다(3 출력). resolve는 첫 호출만 유효하므로 1이 저장됩니다. 동기 코드(4) 실행 후 then 콜백으로 1이 출력됩니다.",
  },
  {
    topic: "스프레드/디스트럭처링",
    code: `const { a = 10, b = 20 } = { a: 0, b: undefined };
console.log(a, b);`,
    options: ["0 20", "10 20", "0 undefined", "10 undefined"],
    answer: 0,
    explanation:
      "디스트럭처링 기본값은 값이 undefined일 때만 적용됩니다. a는 0(falsy지만 undefined 아님)이므로 0, b는 undefined이므로 기본값 20이 적용됩니다.",
  },
];

/* ── 유틸 ── */

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getGrade(ratio: number): { label: string; color: string } {
  if (ratio >= 0.96) return { label: "S+", color: "text-amber-400" };
  if (ratio >= 0.88) return { label: "S", color: "text-amber-400" };
  if (ratio >= 0.76) return { label: "A+", color: "text-violet-400" };
  if (ratio >= 0.64) return { label: "A", color: "text-violet-400" };
  if (ratio >= 0.52) return { label: "B+", color: "text-blue-400" };
  if (ratio >= 0.4) return { label: "B", color: "text-blue-400" };
  if (ratio >= 0.28) return { label: "C", color: "text-emerald-400" };
  return { label: "D", color: "text-zinc-400" };
}

/* ── 컴포넌트 ── */

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState(() => shuffle(QUIZZES));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [corrects, setCorrects] = useState(0);
  const [finished, setFinished] = useState(false);

  const quiz = quizzes[current];
  const total = quizzes.length;
  const isAnswered = selected !== null;
  const isCorrect = selected === quiz?.answer;

  const progressPercent = useMemo(
    () => Math.round(((current + (isAnswered ? 1 : 0)) / total) * 100),
    [current, isAnswered, total]
  );

  const handleSelect = useCallback(
    (idx: number) => {
      if (isAnswered) return;
      setSelected(idx);
      if (idx === quiz.answer) setCorrects((c) => c + 1);
    },
    [isAnswered, quiz]
  );

  const handleNext = useCallback(() => {
    if (current + 1 >= total) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }, [current, total]);

  const handleRestart = useCallback(() => {
    setQuizzes(shuffle(QUIZZES));
    setCurrent(0);
    setSelected(null);
    setCorrects(0);
    setFinished(false);
  }, []);

  const grade = useMemo(() => getGrade(corrects / total), [corrects, total]);

  /* ── 결과 화면 ── */
  if (finished) {
    return (
      <div className="noise grid-bg relative min-h-screen">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
          <div className="anim-fade-up flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl border border-card-border bg-card-bg/60 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-zinc-100">퀴즈 완료!</h2>

            <div className="flex flex-col items-center gap-2">
              <span className={`text-6xl font-black ${grade.color}`}>
                {grade.label}
              </span>
              <span className="font-mono text-sm text-zinc-400">
                {corrects} / {total} 문제 정답
              </span>
              <span className="font-mono text-xs text-zinc-500">
                정답률 {Math.round((corrects / total) * 100)}%
              </span>
            </div>

            <div className="w-full rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${Math.round((corrects / total) * 100)}%` }}
              />
            </div>

            <div className="flex w-full flex-col gap-1 text-xs font-mono text-zinc-500">
              <div className="flex justify-between">
                <span>정답</span>
                <span className="text-emerald-400">{corrects}문제</span>
              </div>
              <div className="flex justify-between">
                <span>오답</span>
                <span className="text-red-400">{total - corrects}문제</span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="mt-2 rounded-xl border border-card-border bg-linear-to-r from-blue-500/20 to-indigo-500/20 px-8 py-3 font-semibold text-zinc-100 transition-all hover:border-blue-500/40 hover:from-blue-500/30 hover:to-indigo-500/30"
            >
              다시 풀기 🔄
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── 퀴즈 화면 ── */
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              코딩 퀴즈
            </span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            이 코드의 출력 결과는?
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex w-full max-w-xl flex-col gap-2">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
            <span>
              {current + 1} / {total}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-zinc-600">
            <span className="rounded-md border border-card-border bg-card-bg/60 px-2 py-0.5">
              {quiz.topic}
            </span>
            <span>
              정답{" "}
              <span className="text-emerald-400">{corrects}</span>
            </span>
          </div>
        </div>

        {/* Quiz Card */}
        <div className="flex w-full max-w-xl flex-col gap-5">
          {/* Code Block */}
          <div className="overflow-x-auto rounded-xl border border-card-border bg-zinc-900/80 p-4 backdrop-blur-sm">
            <pre className="font-mono text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
              <code>{quiz.code}</code>
            </pre>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {quiz.options.map((opt, idx) => {
              let borderClass = "border-card-border hover:border-accent/30";
              let bgClass = "bg-card-bg/40";
              let textClass = "text-zinc-300";

              if (isAnswered) {
                if (idx === quiz.answer) {
                  borderClass = "border-emerald-500/60";
                  bgClass = "bg-emerald-500/10";
                  textClass = "text-emerald-300";
                } else if (idx === selected) {
                  borderClass = "border-red-500/60";
                  bgClass = "bg-red-500/10";
                  textClass = "text-red-300";
                } else {
                  borderClass = "border-card-border";
                  textClass = "text-zinc-600";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`flex items-center gap-3 rounded-xl border ${borderClass} ${bgClass} px-4 py-3 text-left font-mono text-sm transition-all ${textClass} ${
                    !isAnswered ? "cursor-pointer hover:-translate-y-0.5" : ""
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                      isAnswered && idx === quiz.answer
                        ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                        : isAnswered && idx === selected
                          ? "border-red-500/60 bg-red-500/20 text-red-300"
                          : "border-card-border bg-card-bg text-zinc-500"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                  {isAnswered && idx === quiz.answer && (
                    <span className="ml-auto text-emerald-400">✓</span>
                  )}
                  {isAnswered && idx === selected && idx !== quiz.answer && (
                    <span className="ml-auto text-red-400">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div
              className={`anim-fade-up rounded-xl border p-4 backdrop-blur-sm ${
                isCorrect
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    isCorrect ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isCorrect ? "정답입니다! 🎉" : "오답입니다 😅"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-400">
                {quiz.explanation}
              </p>
            </div>
          )}

          {/* Next / Finish Button */}
          {isAnswered && (
            <button
              onClick={handleNext}
              className="anim-fade-up mt-1 self-end rounded-xl border border-card-border bg-linear-to-r from-blue-500/20 to-indigo-500/20 px-6 py-2.5 font-semibold text-zinc-100 transition-all hover:border-blue-500/40 hover:from-blue-500/30 hover:to-indigo-500/30"
            >
              {current + 1 >= total ? "결과 보기 →" : "다음 문제 →"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
