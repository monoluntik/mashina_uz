"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";

interface LoanCalculatorProps {
  carPrice: number;
  locale: string;
}

export default function LoanCalculator({ carPrice, locale }: LoanCalculatorProps) {
  const [downPct, setDownPct] = useState(20);
  const [years, setYears] = useState(3);
  const [rate, setRate] = useState(18);

  const { monthly, totalPay, totalInterest, loanAmount } = useMemo(() => {
    const loanAmount = carPrice * (1 - downPct / 100);
    const monthlyRate = rate / 100 / 12;
    const n = years * 12;
    const monthly =
      monthlyRate === 0
        ? loanAmount / n
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
          (Math.pow(1 + monthlyRate, n) - 1);
    const totalPay = monthly * n;
    const totalInterest = totalPay - loanAmount;
    return { monthly, totalPay, totalInterest, loanAmount };
  }, [carPrice, downPct, years, rate]);

  const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const labels =
    locale === "ru"
      ? {
          title: "Калькулятор кредита",
          down: "Первоначальный взнос",
          term: "Срок",
          rateLabel: "Ставка в год",
          monthly: "Ежемесячный платёж",
          loan: "Сумма кредита",
          total: "Итого с процентами",
          interest: "Переплата",
          years: "лет",
          sum: "сум",
        }
      : {
          title: "Kredit kalkulyatori",
          down: "Boshlang'ich to'lov",
          term: "Muddati",
          rateLabel: "Yillik stavka",
          monthly: "Oylik to'lov",
          loan: "Kredit miqdori",
          total: "Foiz bilan jami",
          interest: "Ortiqcha to'lov",
          years: "yil",
          sum: "so'm",
        };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-gray-900">{labels.title}</h2>
      </div>

      {/* Down payment */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{labels.down}</span>
          <span className="font-semibold text-gray-900">{downPct}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={90}
          step={5}
          value={downPct}
          onChange={(e) => setDownPct(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="text-xs text-gray-400 mt-0.5">
          {fmt(carPrice * (downPct / 100))} {labels.sum}
        </div>
      </div>

      {/* Term */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{labels.term}</span>
          <span className="font-semibold text-gray-900">
            {years} {labels.years}
          </span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 5, 7].map((y) => (
            <button
              key={y}
              onClick={() => setYears(y)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                years === y
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-blue-400"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Rate */}
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{labels.rateLabel}</span>
          <span className="font-semibold text-gray-900">{rate}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={35}
          step={1}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      {/* Result */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{labels.monthly}</span>
          <span className="text-xl font-bold text-blue-600">
            {fmt(monthly)} {labels.sum}
          </span>
        </div>
        <div className="border-t border-blue-100 pt-2 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{labels.loan}</span>
            <span className="font-medium text-gray-900">{fmt(loanAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{labels.interest}</span>
            <span className="font-medium text-orange-600">+{fmt(totalInterest)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{labels.total}</span>
            <span className="font-medium text-gray-900">{fmt(totalPay)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
