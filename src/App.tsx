import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DivinationForm } from "./components/DivinationForm";
import { HexagramBoard } from "./components/HexagramBoard";
import { LearningGuide } from "./components/LearningGuide";
import { DivinationResult, SixRelative, YaoRemainder } from "./types/liuyao";
import { getGanzhiFromDate } from "./utils/calendar";
import { calculateLiuYaoDivination, calculateNumberGua } from "./utils/liuyaoEngine";
import confetti from "canvas-confetti";

export function App() {
  const [activeTab, setActiveTab] = useState<"paipan" | "guide">("paipan");
  const [divinationResult, setDivinationResult] = useState<DivinationResult | null>(null);

  // Initial demo calculation on first mount using classic number divination (431, 379, 847)
  useEffect(() => {
    if (!divinationResult) {
      const now = new Date();
      const ganzhi = getGanzhiFromDate(now);
      const demoNumberGua = calculateNumberGua(431, 379, 847);
      const demoResult = calculateLiuYaoDivination(
        "求占居士",
        "問今年下半年事業升遷與財運發展？",
        demoNumberGua.remainders,
        ganzhi,
        "官鬼",
        [431, 379, 847]
      );
      setDivinationResult(demoResult);
    }
  }, []);

  const handleCalculate = (data: {
    querent: string;
    question: string;
    date: Date;
    remainders: YaoRemainder[];
    customYongShen?: SixRelative;
    numberNumbers?: [number, number, number];
  }) => {
    const ganzhi = getGanzhiFromDate(data.date);
    const result = calculateLiuYaoDivination(
      data.querent,
      data.question,
      data.remainders,
      ganzhi,
      data.customYongShen,
      data.numberNumbers
    );

    setDivinationResult(result);
    setActiveTab("paipan");

    // Subtle celebration feedback
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.85 },
        colors: ["#d97706", "#f59e0b", "#fbbf24", "#78716c"],
      });
    } catch {
      // ignore
    }
  };

  const handleYongShenChange = (newRelative: SixRelative) => {
    if (!divinationResult) return;
    const ganzhi = getGanzhiFromDate(divinationResult.date);
    const updated = calculateLiuYaoDivination(
      divinationResult.querent,
      divinationResult.question,
      divinationResult.remainders,
      ganzhi,
      newRelative,
      divinationResult.numberNumbers
    );
    setDivinationResult(updated);
  };

  return (
    <div className="min-h-screen text-stone-900 font-sans selection:bg-amber-500/20 selection:text-amber-900">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-3.5 py-6 sm:px-6 sm:py-8">
        {activeTab === "paipan" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Input Form */}
            <DivinationForm
              onCalculate={handleCalculate}
              initialValues={
                divinationResult
                  ? {
                      querent: divinationResult.querent,
                      question: divinationResult.question,
                      date: divinationResult.date,
                      remainders: divinationResult.remainders,
                    }
                  : undefined
              }
            />

            {/* Hexagram Result Board */}
            {divinationResult && (
              <div id="hexagram-board-section">
                <HexagramBoard
                  result={divinationResult}
                  onYongShenChange={handleYongShenChange}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "guide" && <LearningGuide />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-white/80 py-8 text-center text-xs text-stone-600 backdrop-blur shadow-xs">
        <p className="font-serif font-medium text-stone-800">數字占卜排盤系統 · 傳承先天八卦數理、京房納甲法、伏神推算與易理全鑑</p>
        <p className="mt-1 text-stone-500">
          參伍以變，錯綜其數，通其變遂成天下之文，極其數遂定天下之象
        </p>
      </footer>
    </div>
  );
}
export default App;
