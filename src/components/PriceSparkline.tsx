"use client";

interface Point { price: number; date: string }

export default function PriceSparkline({ priceHistory, locale }: { priceHistory: string; locale: string }) {
  let points: Point[] = [];
  try { points = JSON.parse(priceHistory); } catch { return null; }
  if (points.length < 2) return null;

  const isRu = locale === "ru";
  const all = [...points.map(p => p.price)];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  const W = 120, H = 36, PAD = 4;
  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const ys = points.map(p => PAD + ((max - p.price) / range) * (H - PAD * 2));

  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const first = points[0].price;
  const last = points[points.length - 1].price;
  const diff = first - last;
  const pct = Math.round((Math.abs(diff) / first) * 100);
  const down = diff > 0;
  const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{isRu ? "История цены" : "Narx tarixi"}</span>
        {pct > 0 && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${down ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {down ? "↓" : "↑"} {pct}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <svg width={W} height={H} className="flex-shrink-0">
          <path d={d} fill="none" stroke={down ? "#16a34a" : "#dc2626"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3" fill={down ? "#16a34a" : "#dc2626"} />
        </svg>
        <div className="text-xs text-gray-500 space-y-0.5 min-w-0">
          <div>{isRu ? "Было:" : "Avval:"} <span className="font-medium text-gray-700">{fmt(first)}</span></div>
          <div>{isRu ? "Стало:" : "Hozir:"} <span className="font-medium text-gray-700">{fmt(last)}</span></div>
        </div>
      </div>
    </div>
  );
}
