"use client";

import { useState, useEffect, useCallback } from "react";
import ScoreBoard from "../components/ScoreBoard";

const ANSWERS = [
  "apple","beach","chair","dance","eagle","flame","grape","house","image","juice",
  "knife","lemon","mouse","night","ocean","piano","queen","river","stone","table",
  "ultra","voice","water","xenon","yacht","zebra","angel","brave","candy","dream",
  "earth","fairy","ghost","happy","ivory","jolly","karma","light","magic","nerve",
  "olive","pearl","quiet","royal","sheep","tiger","unity","vigor","whale","youth",
  "about","above","abuse","actor","acute","admit","adopt","adult","agent","agree",
  "ahead","alarm","album","alert","alien","align","alive","allow","alone","alter",
  "among","anger","angle","angry","anime","ankle","annoy","apart","arena","argue",
  "arise","armor","array","aside","asset","atlas","audio","avoid","awake","award",
  "aware","awful","bacon","badge","badly","baker","basic","basis","begin","being",
  "bench","berry","bible","birth","black","blade","blame","bland","blank","blast",
  "blaze","bleed","blend","blind","block","bloom","blown","blues","blunt","board",
  "bonus","boost","bound","brain","brand","brass","bread","break","breed","brick",
  "brief","broad","broke","brook","brush","buddy","build","bunch","burst","buyer",
  "cabin","cable","camel","candy","cargo","carry","catch","cause","chain","chalk",
  "chaos","charm","chase","cheap","check","chess","chest","chief","child","chill",
  "chunk","civic","civil","claim","clash","class","clean","clear","clerk","climb",
  "cling","clock","clone","close","cloth","cloud","coach","coast","color","comet",
  "comic","coral","count","court","cover","crack","craft","crane","crash","crazy",
  "cream","crime","crisp","cross","crowd","crush","curve","cycle","daily","dairy",
];

const VALID_WORDS = new Set([
  ...ANSWERS,
  "abled","abort","acorn","adept","admin","adore","aegis","agile","aisle","alibi",
  "amber","ample","amuse","anvil","aorta","attic","audit","badge","bagel","balms",
  "bands","barge","baron","batch","bears","belle","below","bikes","blank","bliss",
  "blown","bluff","bogus","bolts","bonds","bones","books","booth","boxer","braid",
  "brawn","brews","bride","brine","brisk","brown","brush","budge","buggy","bulge",
  "bumps","bunch","burns","cacao","cache","calls","camps","cards","carve","cedar",
  "chant","chaps","chars","cheek","cheer","china","choir","chord","chore","churn",
  "cider","cigar","cinch","cited","civic","civil","clamp","clams","clang","clank",
  "claps","clash","clasp","claws","clerk","click","cliff","clips","cloak","clone",
  "clout","clubs","cluck","clued","clues","clump","clung","coals","coded","codes",
  "coins","combo","comes","comet","comma","could","crews","crops","crowd","crude",
  "crumb","crust","curly","dates","deals","debug","decal","decks","decor","delay",
  "delta","demon","depot","depth","derby","detox","devil","diary","digit","diner",
  "disco","ditch","dodge","doing","donor","doubt","dough","draft","drain","drape",
  "drawn","dread","dress","dried","drift","drill","drink","drive","drone","drops",
  "drove","drugs","drums","drunk","dryly","dumbs","dunks","dusty","dwarf","dying",
  "early","easel","eater","edges","eight","eject","elder","elect","elfin","elite",
  "embed","emits","emoji","empty","ended","enemy","enjoy","entry","envoy","epoch",
  "equal","equip","erode","error","essay","ethic","evade","event","every","exact",
  "exams","exert","exile","exist","extra","exude","fable","facts","faint","faith",
  "falls","false","fancy","fangs","farms","fatal","fault","feast","feels","fence",
  "fetch","fever","fewer","fiber","field","fifth","fifty","fight","filth","final",
  "finds","first","fixed","flair","flaky","flank","flaps","flare","flash","flask",
  "flats","flesh","flick","flies","fling","flint","flips","float","flock","flood",
  "floor","flour","fluid","flush","flute","focal","focus","foggy","fonts","force",
  "forge","forms","forth","forum","found","foxes","frame","frank","fraud","fresh",
  "front","frost","froze","fruit","fully","funds","funny","fuzzy","gains","games",
  "gases","gauge","gazer","gecko","genes","genre","gifts","given","gives","gland",
  "glare","glass","gleam","glide","globe","gloom","gloss","glove","glyph","gnome",
  "going","gonna","goods","goose","grace","grade","graft","grain","grand","grant",
  "grasp","grass","grave","grays","graze","great","greed","green","greet","grief",
  "grill","grind","gripe","grips","groan","groom","gross","group","grove","growl",
  "grown","guard","guess","guest","guide","guild","guilt","guise","gulps","gummy",
  "guppy","gusts","gypsy","habit","hands","handy","hardy","haste","hasty","hatch",
  "haunt","haven","heads","heard","heart","heavy","hedge","heels","hefty","hello",
  "hence","herbs","hinge","hobby","holds","homes","honor","hoped","hopes","horns",
  "horse","hotel","hound","hover","human","humid","humor","hurry","ideal","index",
  "indie","inner","input","intro","issue","items","ivory","jelly","jewel","joint",
  "joker","judge","jumbo","jumps","keeps","knack","kneel","knelt","knobs","knock",
  "knots","known","knows","label","labor","lakes","lance","lanes","large","laser",
  "later","latex","layer","leads","leapt","learn","lease","least","ledge","legal",
  "level","lever","links","lions","lists","liver","lobby","local","locks","lodge",
  "logic","looks","loose","lorry","lover","lower","lucky","lunar","lunch","lyric",
  "macro","major","maker","manor","maple","march","marks","marsh","masks","match",
  "maybe","mayor","meals","means","medal","media","melon","mercy","merge","merit",
  "messy","metal","meter","midst","might","miner","minor","minus","mixed","mixer",
  "model","money","month","moral","motor","mound","mount","mourn","mouth","moved",
  "mover","movie","muddy","murky","music","nails","naive","named","names","nanny",
  "needs","newly","nexus","niche","ninja","noble","noise","norms","north","noted",
  "notes","novel","nudge","nurse","nutty","nylon","oasis","occur","oddly","offer",
  "often","onset","opera","orbit","order","organ","other","ought","outer","outgo",
  "ovens","owner","oxide","ozone","paced","packs","paddy","pages","paint","pairs",
  "palms","panel","panic","pants","paper","parks","parts","party","paste","patch",
  "paths","pause","peace","peach","peaks","pedal","penny","perch","peril","phase",
  "phone","photo","picks","piece","pilot","pinch","pitch","pixel","pizza","place",
  "plain","plane","plank","plans","plant","plate","plaza","plead","pleas","plier",
  "pluck","plugs","plumb","plume","plump","plums","plunk","plush","poets","point",
  "polar","polls","polyp","ponds","pools","popup","porch","ports","posed","poses",
  "pound","power","press","price","pride","prime","print","prior","prism","prize",
  "probe","prone","proof","props","prose","proud","prove","proxy","prude","prune",
  "pulse","pumps","punch","pupil","purse","pushy","radar","radio","raise","rally",
  "ranch","range","ranks","rapid","rated","ratio","reach","realm","rebel","refer",
  "reign","relax","relay","renal","renew","repay","reply","rider","ridge","rifle",
  "rigid","rigor","rings","risen","rises","risks","risky","rival","roads","roast",
  "robot","rocky","rogue","roman","rooms","roots","roses","rough","round","route",
  "rover","ruins","ruled","ruler","rules","rural","rusty","sadly","saint","salad",
  "salon","salty","sauce","saved","saves","scale","scare","scary","scene","scent",
  "scope","score","scout","scrap","seeds","seize","sense","serum","serve","seven",
  "shade","shaft","shake","shall","shame","shape","share","shark","sharp","shave",
  "shelf","shell","shift","shire","shirt","shock","shoes","shoot","shore","short",
  "shout","shown","shows","sided","sight","sigma","signs","silly","since","sixth",
  "sixty","sized","sizes","skill","skull","slash","slate","slave","sleek","sleep",
  "slept","slice","slide","slope","smart","smell","smile","smoke","snack","snake",
  "solar","solid","solve","songs","sorry","sorts","souls","sound","south","space",
  "spare","speak","speed","spend","spent","spice","spike","spine","spite","split",
  "spoke","spoon","sport","spray","squad","stack","staff","stage","stain","stake",
  "stall","stamp","stand","stare","stark","start","state","stays","steal","steam",
  "steel","steep","steer","stems","steps","stern","stick","stiff","still","sting",
  "stock","stole","stood","stool","stops","store","storm","story","stove","strap",
  "straw","stray","strip","stuck","stuff","stump","stung","stunt","style","sugar",
  "suite","sunny","super","surge","sushi","swamp","swear","sweat","sweep","sweet",
  "swept","swift","swing","swirl","sworn","swung","taxes","teach","teeth","tempo",
  "tends","tense","terms","tests","thank","theft","theme","thick","thing","think",
  "third","thorn","those","three","threw","throw","thumb","tidal","tight","timer",
  "tired","title","today","token","total","touch","tough","tower","toxic","trace",
  "track","trade","trail","train","trait","traps","trash","treat","trend","trial",
  "tribe","trick","tried","tries","trips","troop","trout","truck","truly","trump",
  "trunk","trust","truth","tumor","tuner","turns","tutor","twice","twist","typed",
  "types","ulcer","under","unfit","union","unite","units","until","upper","upset",
  "urban","usage","usual","utter","valid","value","valve","vapor","vault","vegan",
  "venom","venue","verse","video","vigor","vinyl","viral","virus","visit","vital",
  "vivid","vocal","vodka","vogue","voter","wages","waste","watch","waves","weary",
  "weave","weeds","weigh","weird","wheat","wheel","where","which","while","white",
  "whole","whose","width","witch","woman","women","woods","world","worry","worse",
  "worst","worth","would","wound","wrath","wrist","write","wrong","wrote","yield",
  "young","zones",
]);

type TileState = "empty" | "filled" | "correct" | "present" | "absent";

interface Tile {
  letter: string;
  state: TileState;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

function getRandomAnswer(): string {
  return ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
}

function evaluateGuess(
  guess: string,
  answer: string,
): ("correct" | "present" | "absent")[] {
  const result: ("correct" | "present" | "absent")[] = Array(5).fill("absent");
  const answerChars = answer.split("");
  const remaining: (string | null)[] = [...answerChars];

  // First pass: correct positions
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
      remaining[i] = null;
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const idx = remaining.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = "present";
      remaining[idx] = null;
    }
  }

  return result;
}

export default function WordlePage() {
  const [answer, setAnswer] = useState("");
  const [board, setBoard] = useState<Tile[][]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [phase, setPhase] = useState<"playing" | "won" | "lost">("playing");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [keyColors, setKeyColors] = useState<Record<string, TileState>>({});
  const [showRanking, setShowRanking] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const initBoard = useCallback((): Tile[][] => {
    return Array.from({ length: 6 }, () =>
      Array.from({ length: 5 }, () => ({ letter: "", state: "empty" as TileState })),
    );
  }, []);

  const startNewGame = useCallback(() => {
    setAnswer(getRandomAnswer());
    setBoard(initBoard());
    setCurrentRow(0);
    setCurrentCol(0);
    setPhase("playing");
    setShake(false);
    setMessage("");
    setKeyColors({});
    setShowRanking(false);
    setFinalScore(0);
  }, [initBoard]);

  useEffect(() => {
    startNewGame();
    const saved = localStorage.getItem("wordle-best");
    if (saved) setBestScore(Number(saved));
  }, [startNewGame]);

  const showMessage = useCallback((msg: string, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (phase !== "playing") return;

      if (key === "ENTER") {
        if (currentCol < 5) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          showMessage("5글자를 입력하세요");
          return;
        }

        const guess = board[currentRow].map((t) => t.letter).join("");
        if (!VALID_WORDS.has(guess)) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          showMessage("유효하지 않은 단어입니다");
          return;
        }

        const evaluation = evaluateGuess(guess, answer);
        const newBoard = board.map((row) => row.map((t) => ({ ...t })));
        const newKeyColors = { ...keyColors };

        for (let i = 0; i < 5; i++) {
          newBoard[currentRow][i].state = evaluation[i];
          const letter = guess[i].toUpperCase();
          const priority: Record<string, number> = { correct: 3, present: 2, absent: 1 };
          const current = newKeyColors[letter];
          if (!current || priority[evaluation[i]] > (priority[current] ?? 0)) {
            newKeyColors[letter] = evaluation[i];
          }
        }

        setBoard(newBoard);
        setKeyColors(newKeyColors);

        if (guess === answer) {
          const attempts = currentRow + 1;
          setPhase("won");
          setFinalScore(attempts);
          showMessage(`${attempts}번 만에 맞췄어요! 🎉`, 3000);
          if (bestScore === 0 || attempts < bestScore) {
            setBestScore(attempts);
            localStorage.setItem("wordle-best", String(attempts));
          }
          setTimeout(() => setShowRanking(true), 800);
        } else if (currentRow === 5) {
          setPhase("lost");
          setFinalScore(7);
          showMessage(`정답: ${answer.toUpperCase()}`, 5000);
          setTimeout(() => setShowRanking(true), 800);
        }

        setCurrentRow((r) => r + 1);
        setCurrentCol(0);
        return;
      }

      if (key === "⌫" || key === "BACKSPACE") {
        if (currentCol > 0) {
          const newBoard = board.map((row) => row.map((t) => ({ ...t })));
          newBoard[currentRow][currentCol - 1].letter = "";
          newBoard[currentRow][currentCol - 1].state = "empty";
          setBoard(newBoard);
          setCurrentCol((c) => c - 1);
        }
        return;
      }

      if (/^[A-Z]$/.test(key) && currentCol < 5) {
        const newBoard = board.map((row) => row.map((t) => ({ ...t })));
        newBoard[currentRow][currentCol].letter = key.toLowerCase();
        newBoard[currentRow][currentCol].state = "filled";
        setBoard(newBoard);
        setCurrentCol((c) => c + 1);
      }
    },
    [phase, currentCol, currentRow, board, answer, keyColors, bestScore, showMessage],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleKey(key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const tileColor = (state: TileState) => {
    switch (state) {
      case "correct":
        return "bg-green-500 border-green-500 text-white";
      case "present":
        return "bg-yellow-500 border-yellow-500 text-white";
      case "absent":
        return "bg-zinc-700 border-zinc-700 text-white";
      case "filled":
        return "border-zinc-500 bg-card-bg text-white";
      default:
        return "border-card-border bg-card-bg/40 text-white";
    }
  };

  const keyBg = (key: string) => {
    const state = keyColors[key];
    switch (state) {
      case "correct":
        return "bg-green-500 text-white border-green-500";
      case "present":
        return "bg-yellow-500 text-white border-yellow-500";
      case "absent":
        return "bg-zinc-700 text-zinc-400 border-zinc-700";
      default:
        return "bg-white/8 text-zinc-200 border-card-border hover:bg-white/15";
    }
  };

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              워들
            </span>
            <span className="ml-2">🟩</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            5글자 영단어를 6번 안에 맞춰보세요!
          </p>
        </div>

        {/* Stats */}
        <div className="mb-4 flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Best
            </span>
            <span className="font-mono text-lg font-bold text-gold">
              {bestScore ? `${bestScore}/6` : "-"}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              시도
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {currentRow}/6
            </span>
          </div>
        </div>

        {/* Message toast */}
        {message && (
          <div className="mb-3 rounded-lg border border-card-border bg-card-bg/95 px-4 py-2 font-mono text-sm text-white shadow-lg backdrop-blur-sm">
            {message}
          </div>
        )}

        {/* Board */}
        <div className="mb-5 flex flex-col gap-1.5">
          {board.map((row, ri) => (
            <div
              key={ri}
              className={`flex gap-1.5 ${shake && ri === currentRow ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
            >
              {row.map((tile, ci) => (
                <div
                  key={ci}
                  className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 font-mono text-2xl font-bold uppercase transition-all duration-300 sm:h-16 sm:w-16 ${tileColor(tile.state)} ${tile.state === "filled" ? "scale-105" : ""}`}
                >
                  {tile.letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <div className="flex flex-col gap-1.5">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKey(key === "⌫" ? "⌫" : key)}
                  className={`flex items-center justify-center rounded-lg border font-mono text-sm font-bold transition-all active:scale-95 ${
                    key === "ENTER" || key === "⌫"
                      ? "h-12 px-3 text-xs sm:px-4"
                      : "h-12 w-9 sm:w-10"
                  } ${keyBg(key)}`}
                >
                  {key === "ENTER" ? "확인" : key}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* New game button */}
        {phase !== "playing" && (
          <button
            onClick={startNewGame}
            className="mt-5 rounded-xl border border-card-border bg-card-bg px-6 py-2.5 font-mono text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
          >
            새 게임
          </button>
        )}

        <ScoreBoard
          gameId="wordle"
          currentScore={finalScore}
          unit="회"
          show={showRanking}
          onClose={() => {
            setShowRanking(false);
          }}
        />
      </main>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
