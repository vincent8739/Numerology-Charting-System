import React, { useState, useEffect } from "react";
import { Clock, User, HelpCircle, RefreshCw, Hash, CheckCircle2, ArrowRight, Sparkles, BookOpen, Layers } from "lucide-react";
import { SixRelative, YaoRemainder, NumberGuaCalculation } from "../types/liuyao";
import { getGanzhiFromDate, GanzhiResult } from "../utils/calendar";
import { calculateNumberGua, EARLY_HEAVEN_BAGUA_MAP } from "../utils/liuyaoEngine";

interface DivinationFormProps {
  onCalculate: (data: {
    querent: string;
    question: string;
    date: Date;
    remainders: YaoRemainder[];
    customYongShen?: SixRelative;
    numberNumbers?: [number, number, number];
  }) => void;
  initialValues?: {
    querent: string;
    question: string;
    date: Date;
    remainders: YaoRemainder[];
    numberNumbers?: [number, number, number];
  };
}

const PRESET_QUESTIONS = [
  { label: "求財經營", relative: "妻財" as SixRelative, text: "問近期投資營商財運如何？" },
  { label: "事業工作", relative: "官鬼" as SixRelative, text: "問求職升遷與事業前景發展？" },
  { label: "戀愛婚姻", relative: "妻財" as SixRelative, text: "問感情姻緣與對方心意發展？" },
  { label: "身體健康", relative: "子孫" as SixRelative, text: "問身體健康狀況與求醫調理？" },
  { label: "考試升學", relative: "父母" as SixRelative, text: "問文憑證照與考試錄取結果？" },
  { label: "訴訟官司", relative: "官鬼" as SixRelative, text: "問官非紛爭與法務審理吉凶？" },
  { label: "出門遠行", relative: "子孫" as SixRelative, text: "問出外旅行、出差平安順遂？" },
  { label: "尋人失物", relative: "妻財" as SixRelative, text: "問遺失物品方位或失散音訊？" },
];

export const DivinationForm: React.FC<DivinationFormProps> = ({
  onCalculate,
  initialValues,
}) => {
  const [querent, setQuerent] = useState(initialValues?.querent || "");
  const [question, setQuestion] = useState(initialValues?.question || "");
  const [date, setDate] = useState<Date>(initialValues?.date || new Date());

  // Date and Time breakdown fields
  const [year, setYear] = useState<number>(date.getFullYear());
  const [month, setMonth] = useState<number>(date.getMonth() + 1);
  const [day, setDay] = useState<number>(date.getDate());
  const [hour, setHour] = useState<number>(date.getHours());
  const [minute, setMinute] = useState<number>(date.getMinutes());

  // 數字卦三個三位數 (第一數求下卦、第二數求上卦、第三數求動爻)
  const [num1, setNum1] = useState<number>(initialValues?.numberNumbers?.[0] || 431);
  const [num2, setNum2] = useState<number>(initialValues?.numberNumbers?.[1] || 379);
  const [num3, setNum3] = useState<number>(initialValues?.numberNumbers?.[2] || 847);

  // Derived calculation
  const [numGuaCalc, setNumGuaCalc] = useState<NumberGuaCalculation>(() =>
    calculateNumberGua(num1, num2, num3)
  );

  const [ganzhiPreview, setGanzhiPreview] = useState<GanzhiResult>(getGanzhiFromDate(date));
  const [selectedYongShen, setSelectedYongShen] = useState<SixRelative | undefined>(undefined);

  // Update calculation whenever numbers change
  useEffect(() => {
    const calc = calculateNumberGua(num1, num2, num3);
    setNumGuaCalc(calc);
  }, [num1, num2, num3]);

  // Sync date when components change
  useEffect(() => {
    try {
      const newDate = new Date(year, month - 1, day, hour, minute, 0);
      setDate(newDate);
      setGanzhiPreview(getGanzhiFromDate(newDate));
    } catch {
      // ignore invalid dates
    }
  }, [year, month, day, hour, minute]);

  const handleSetCurrentTime = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setHour(now.getHours());
    setMinute(now.getMinutes());
    setDate(now);
    setGanzhiPreview(getGanzhiFromDate(now));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      querent: querent.trim() || "求占者",
      question: question.trim() || "問事吉凶",
      date,
      remainders: numGuaCalc.remainders,
      customYongShen: selectedYongShen,
      numberNumbers: [num1, num2, num3],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Querent & Question Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-amber-600" />
            <h2 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
              第一步：填寫求占資訊與問卦事由
            </h2>
          </div>
          <span className="text-xs text-stone-500">誠心默念 · 專注所問</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Querent Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-700">
              求占者姓名（或稱謂）
            </label>
            <div className="relative">
              <input
                id="input-querent-name"
                type="text"
                value={querent}
                onChange={(e) => setQuerent(e.target.value)}
                placeholder="例如：張信徒、李居士或匿名"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 shadow-2xs transition focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Query Reason */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-700">
              占問事由（具體問事內容）
            </label>
            <div className="relative">
              <input
                id="input-question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例如：問今年下半年跳槽或升遷機運？"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 shadow-2xs transition focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <label className="mb-2 flex items-center gap-1.5 text-xs text-stone-600">
            <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>常用占問類別快捷選擇：</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestion(item.text);
                  setSelectedYongShen(item.relative);
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  question === item.text
                    ? "border-amber-500 bg-amber-50 text-amber-900 font-semibold ring-1 ring-amber-400"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Divination Time & Ganzhi Live Conversion */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <h2 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
              第二步：起卦時間（公曆）與年月日時干支
            </h2>
          </div>
          <button
            id="btn-set-current-time"
            type="button"
            onClick={handleSetCurrentTime}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>取得當前即時時間</span>
          </button>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 block text-xs text-stone-500 font-medium">年（公曆）</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-year"
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">年</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">月</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-month"
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">月</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">日</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-day"
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">日</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">時（24時制）</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-hour"
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">時</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">分</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-minute"
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">分</span>
            </div>
          </div>
        </div>

        {/* Ganzhi & Metaphysics Preview Bar */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 sm:p-3.5">
          <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-3 md:grid-cols-6">
            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">歲次年柱</span>
              <span className="font-serif text-sm font-bold text-stone-900">
                {ganzhiPreview.ganzhiYear}年
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">月建月柱</span>
              <span className="font-serif text-sm font-bold text-stone-900">
                {ganzhiPreview.ganzhiMonth}月（建{ganzhiPreview.yueJian}）
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">日辰日柱</span>
              <span className="font-serif text-sm font-bold text-stone-900">
                {ganzhiPreview.ganzhiDay}日（辰{ganzhiPreview.riChen}）
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">時辰時柱</span>
              <span className="font-serif text-sm font-bold text-stone-900">
                {ganzhiPreview.ganzhiHour}時
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">日旬空亡</span>
              <span className="font-bold text-rose-600 text-sm">
                {ganzhiPreview.xunKong}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">神煞吉星</span>
              <span className="text-stone-800 font-medium text-[11px] leading-tight">
                貴人:{ganzhiPreview.dayGuiRen} · 驛馬:{ganzhiPreview.yiMa} · 祿:{ganzhiPreview.dayLu}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 數字卦起卦步驟與三個三位數輸入 */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-xs space-y-6">
        {/* Step Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 ring-1 ring-amber-300">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                第三步：用數字卦起卦（輸入三個三位數）
              </h2>
              <p className="text-xs text-stone-500">
                依宋代邵雍梅花易數與先天八卦數理，以三組數字推演下卦、上卦與動爻
              </p>
            </div>
          </div>
        </div>

        {/* 占卦步驟指引 */}
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 p-4 text-xs text-stone-700 space-y-2">
          <div className="flex items-center gap-1.5 font-serif font-bold text-amber-900 text-sm">
            <Sparkles className="h-4 w-4 text-amber-700" />
            <span>數字卦 占卦步驟：</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 text-xs">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-[11px]">
                1
              </span>
              <div>
                <strong className="text-stone-900 font-serif">誠心發問：</strong>
                <span className="text-stone-600">靜心凝神，在腦海中誠懇地想著要問的一個具體問題。</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-[11px]">
                2
              </span>
              <div>
                <strong className="text-stone-900 font-serif">取三個三位數：</strong>
                <span className="text-stone-600">憑直覺隨意寫下或想出三個三位數（例如：431、379、847）。</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Number Input Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Number 1: Lower Trigram (求下卦) */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-400">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded bg-amber-100 px-2 py-0.5 font-serif text-xs font-bold text-amber-900">
                第一個三位數 · 求下卦
              </span>
              <span className="text-[11px] font-mono text-stone-500">除以 8 取餘</span>
            </div>

            <div className="my-2">
              <input
                id="input-number-1"
                type="number"
                min={1}
                max={9999}
                value={num1}
                onChange={(e) => setNum1(Number(e.target.value) || 0)}
                placeholder="例如：431"
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-center font-mono text-xl font-bold tracking-wider text-stone-900 shadow-2xs focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            {/* Calculation Result */}
            <div className="mt-2.5 rounded-lg border border-stone-200 bg-white p-2 text-xs">
              <div className="flex items-center justify-between text-stone-500 text-[11px] mb-1">
                <span>運算公式：</span>
                <span className="font-mono font-medium text-stone-700">
                  {num1} ÷ 8 = {Math.floor(num1 / 8)} 餘 {numGuaCalc.lowerRemainder}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-1.5">
                <span className="text-stone-600">下卦（內卦）：</span>
                <span className="font-serif font-bold text-amber-900 text-sm flex items-center gap-1">
                  <span>{EARLY_HEAVEN_BAGUA_MAP[numGuaCalc.lowerRemainder].symbol}</span>
                  <span>{numGuaCalc.lowerTrigram}為{EARLY_HEAVEN_BAGUA_MAP[numGuaCalc.lowerRemainder].nature}卦</span>
                  <span className="text-xs font-mono font-normal text-stone-500">({numGuaCalc.lowerRemainder})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Number 2: Upper Trigram (求上卦) */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-400">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded bg-amber-100 px-2 py-0.5 font-serif text-xs font-bold text-amber-900">
                第二個三位數 · 求上卦
              </span>
              <span className="text-[11px] font-mono text-stone-500">除以 8 取餘</span>
            </div>

            <div className="my-2">
              <input
                id="input-number-2"
                type="number"
                min={1}
                max={9999}
                value={num2}
                onChange={(e) => setNum2(Number(e.target.value) || 0)}
                placeholder="例如：379"
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-center font-mono text-xl font-bold tracking-wider text-stone-900 shadow-2xs focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            {/* Calculation Result */}
            <div className="mt-2.5 rounded-lg border border-stone-200 bg-white p-2 text-xs">
              <div className="flex items-center justify-between text-stone-500 text-[11px] mb-1">
                <span>運算公式：</span>
                <span className="font-mono font-medium text-stone-700">
                  {num2} ÷ 8 = {Math.floor(num2 / 8)} 餘 {numGuaCalc.upperRemainder}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-1.5">
                <span className="text-stone-600">上卦（外卦）：</span>
                <span className="font-serif font-bold text-amber-900 text-sm flex items-center gap-1">
                  <span>{EARLY_HEAVEN_BAGUA_MAP[numGuaCalc.upperRemainder].symbol}</span>
                  <span>{numGuaCalc.upperTrigram}為{EARLY_HEAVEN_BAGUA_MAP[numGuaCalc.upperRemainder].nature}卦</span>
                  <span className="text-xs font-mono font-normal text-stone-500">({numGuaCalc.upperRemainder})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Number 3: Moving Yao (求動爻) */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-400">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded bg-rose-100 px-2 py-0.5 font-serif text-xs font-bold text-rose-900">
                第三個三位數 · 求動爻
              </span>
              <span className="text-[11px] font-mono text-stone-500">除以 6 取餘</span>
            </div>

            <div className="my-2">
              <input
                id="input-number-3"
                type="number"
                min={1}
                max={9999}
                value={num3}
                onChange={(e) => setNum3(Number(e.target.value) || 0)}
                placeholder="例如：847"
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-center font-mono text-xl font-bold tracking-wider text-stone-900 shadow-2xs focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Calculation Result */}
            <div className="mt-2.5 rounded-lg border border-stone-200 bg-white p-2 text-xs">
              <div className="flex items-center justify-between text-stone-500 text-[11px] mb-1">
                <span>運算公式：</span>
                <span className="font-mono font-medium text-stone-700">
                  {num3} ÷ 6 = {Math.floor(num3 / 6)} 餘 {numGuaCalc.movingRemainder}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-1.5">
                <span className="text-stone-600">發動爻位：</span>
                <span className="font-serif font-bold text-rose-700 text-sm flex items-center gap-1">
                  <span>第 {numGuaCalc.movingYaoIndex} 爻發動</span>
                  <span className="text-xs font-normal text-stone-500">
                    ({["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][numGuaCalc.movingYaoIndex - 1]})
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 先天八卦數字對照表 (8 Grid Cards) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
            <div className="flex items-center space-x-1.5 font-serif font-bold text-amber-900 text-sm">
              <Layers className="h-4 w-4 text-amber-700" />
              <span>先天八卦數字對照表</span>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              乾一、兌二、離三、震四、巽五、坎六、艮七、坤八
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              const item = EARLY_HEAVEN_BAGUA_MAP[num];
              const isLower = numGuaCalc.lowerRemainder === num;
              const isUpper = numGuaCalc.upperRemainder === num;

              return (
                <div
                  key={num}
                  className={`relative rounded-lg p-2.5 transition-all border ${
                    isLower && isUpper
                      ? "border-amber-500 bg-amber-200/80 ring-2 ring-amber-400 font-bold shadow-xs text-amber-950"
                      : isLower
                      ? "border-amber-400 bg-amber-100 ring-1 ring-amber-300 font-bold shadow-2xs text-amber-900"
                      : isUpper
                      ? "border-amber-400 bg-amber-100 ring-1 ring-amber-300 font-bold shadow-2xs text-amber-900"
                      : "border-stone-200 bg-white hover:border-amber-300 text-stone-700"
                  }`}
                >
                  <div className="text-base font-serif leading-none mb-1">{item.symbol}</div>
                  <div className="font-serif font-bold text-xs">
                    {item.name}{num}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {item.nature}
                  </div>

                  {/* Badge indicator */}
                  {(isLower || isUpper) && (
                    <div className="mt-1 flex flex-col items-center gap-0.5">
                      {isLower && (
                        <span className="rounded bg-amber-700 px-1 py-0.2 text-[9px] font-bold text-white whitespace-nowrap">
                          下卦
                        </span>
                      )}
                      {isUpper && (
                        <span className="rounded bg-amber-600 px-1 py-0.2 text-[9px] font-bold text-white whitespace-nowrap">
                          上卦
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 卦象即時演算預覽條 (本卦、變卦、六爻圖譜) */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
            <span className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>即時推演卦象：本卦【{numGuaCalc.originalHexagram.name}】之【{numGuaCalc.changedHexagram.name}】</span>
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 border border-amber-300">
              {numGuaCalc.originalHexagram.palace}宮{numGuaCalc.originalHexagram.palaceTypeName} · {numGuaCalc.movingYaoName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 本卦預覽 */}
            <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-xs text-stone-800">
                  本卦：《{numGuaCalc.originalHexagram.name}》
                </span>
                <span className="text-[11px] text-stone-500 font-serif">
                  上{numGuaCalc.upperTrigram}（{EARLY_HEAVEN_BAGUA_MAP[numGuaCalc.upperRemainder].nature}）下{numGuaCalc.lowerTrigram}（{EARLY_HEAVEN_BAGUA_MAP[numGuaCalc.lowerRemainder].nature}）
                </span>
              </div>

              {/* 6 Yao Lines from 上爻 (5) to 初爻 (0) */}
              <div className="space-y-1 font-mono text-xs">
                {[5, 4, 3, 2, 1, 0].map((idx) => {
                  const lineNum = idx + 1;
                  const isMoving = lineNum === numGuaCalc.movingYaoIndex;
                  const rem = numGuaCalc.remainders[idx];
                  const yaoPos = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][idx];

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded px-2 py-1 transition ${
                        isMoving
                          ? "bg-rose-50 border border-rose-300 font-bold text-rose-900"
                          : "text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-[11px] font-serif">{yaoPos}</span>
                        <span className="tracking-widest">
                          {rem === 7 || rem === 9 ? "▅▅▅▅▅" : "▅▅　▅▅"}
                        </span>
                      </div>
                      <div className="text-[11px]">
                        {isMoving ? (
                          <span className="text-rose-600 font-bold">
                            {rem === 9 ? "老陽 ◯ (發動)" : "老陰 ✕ (發動)"}
                          </span>
                        ) : (
                          <span className="text-stone-500">
                            {rem === 7 ? "少陽 (靜)" : "少陰 (靜)"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 變卦預覽 */}
            <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-xs text-stone-800">
                  之卦（變卦）：《{numGuaCalc.changedHexagram.name}》
                </span>
                <span className="text-[11px] text-stone-500 font-serif">
                  上{numGuaCalc.changedHexagram.upperTrigram}下{numGuaCalc.changedHexagram.lowerTrigram} · {numGuaCalc.changedHexagram.palace}宮
                </span>
              </div>

              {/* 6 Yao Lines in Changed Hexagram */}
              <div className="space-y-1 font-mono text-xs">
                {[5, 4, 3, 2, 1, 0].map((idx) => {
                  const lineNum = idx + 1;
                  const isMoving = lineNum === numGuaCalc.movingYaoIndex;
                  const rem = numGuaCalc.remainders[idx];
                  // changed line value
                  const changedBit = rem === 6 ? 1 : rem === 9 ? 0 : rem === 7 ? 1 : 0;
                  const yaoPos = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][idx];

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded px-2 py-1 transition ${
                        isMoving
                          ? "bg-amber-50 border border-amber-300 font-bold text-amber-900"
                          : "text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-[11px] font-serif">{yaoPos}</span>
                        <span className="tracking-widest">
                          {changedBit === 1 ? "▅▅▅▅▅" : "▅▅　▅▅"}
                        </span>
                      </div>
                      <div className="text-[11px]">
                        {isMoving ? (
                          <span className="text-amber-800 font-bold">
                            {changedBit === 1 ? "變少陽 (陽)" : "變少陰 (陰)"}
                          </span>
                        ) : (
                          <span className="text-stone-400">本爻不變</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Button */}
      <div className="flex justify-center pt-2">
        <button
          id="btn-submit-divination"
          type="submit"
          className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.99] sm:w-80 cursor-pointer"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span>立即排盤與伏神推算</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
};
export default DivinationForm;
