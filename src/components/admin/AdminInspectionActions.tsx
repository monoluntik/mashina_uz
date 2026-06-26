"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronUp,
  Link2,
} from "lucide-react";

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Плохое", color: "text-red-500" },
  2: { label: "Удовлетворит.", color: "text-orange-500" },
  3: { label: "Среднее", color: "text-yellow-500" },
  4: { label: "Хорошее", color: "text-blue-500" },
  5: { label: "Отличное", color: "text-green-500" },
};

const COMPONENTS = [
  { key: "engine", label: "Двигатель" },
  { key: "transmission", label: "Коробка передач" },
  { key: "suspension", label: "Подвеска" },
  { key: "brakes", label: "Тормоза" },
  { key: "electrical", label: "Электрика" },
  { key: "interior", label: "Салон" },
  { key: "tires", label: "Шины и диски" },
];

const BODY_PANELS = [
  { key: "hood", label: "Капот" },
  { key: "roof", label: "Крыша" },
  { key: "frontBumper", label: "Передний бампер" },
  { key: "rearBumper", label: "Задний бампер" },
  { key: "trunkLid", label: "Крышка багажника" },
  { key: "frontLeftDoor", label: "Пер. лев. дверь" },
  { key: "frontRightDoor", label: "Пер. прав. дверь" },
  { key: "rearLeftDoor", label: "Задн. лев. дверь" },
  { key: "rearRightDoor", label: "Задн. прав. дверь" },
  { key: "frontLeftFender", label: "Пер. лев. крыло" },
  { key: "frontRightFender", label: "Пер. прав. крыло" },
];

type ExistingReport = {
  engine: number;
  transmission: number;
  suspension: number;
  brakes: number;
  electrical: number;
  interior: number;
  tires: number;
  bodyPanels: Record<string, number>;
  hasAccident: boolean;
  accidentDetails?: string | null;
  mileageVerified: boolean;
  inspectorNotes: string;
  inspectorName: string;
  inspectedAt: string;
};

type Props = {
  request: {
    id: number;
    status: string;
    scheduledAt: string | null;
    listingId: number | null;
  };
  listings: { id: number; brand: string; model: string; year: number; sellerName: string }[];
  existingReport: ExistingReport | null;
  inspectorName: string;
};

export default function AdminInspectionActions({ request, listings, existingReport, inspectorName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(
    request.scheduledAt ? request.scheduledAt.slice(0, 16) : ""
  );
  const [linkedListingId, setLinkedListingId] = useState<string>(
    request.listingId ? String(request.listingId) : ""
  );
  const [showReportForm, setShowReportForm] = useState(!!existingReport);

  const defaultScores: Record<string, number> = Object.fromEntries(
    COMPONENTS.map((c) => [c.key, existingReport ? ((existingReport as unknown as Record<string, number>)[c.key] ?? 3) : 3])
  );
  const [scores, setScores] = useState<Record<string, number>>(defaultScores);

  const defaultPanels: Record<string, number> = Object.fromEntries(
    BODY_PANELS.map((p) => [p.key, existingReport?.bodyPanels?.[p.key] ?? 3])
  );
  const [panels, setPanels] = useState<Record<string, number>>(defaultPanels);

  const [hasAccident, setHasAccident] = useState(existingReport?.hasAccident ?? false);
  const [accidentDetails, setAccidentDetails] = useState(existingReport?.accidentDetails ?? "");
  const [mileageVerified, setMileageVerified] = useState(existingReport?.mileageVerified ?? true);
  const [inspectorNotes, setInspectorNotes] = useState(existingReport?.inspectorNotes ?? "");
  const [inspectedAt, setInspectedAt] = useState(
    existingReport ? existingReport.inspectedAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const patch = async (data: Record<string, unknown>) => {
    setLoading(true);
    await fetch(`/api/admin/inspection-requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    router.refresh();
  };

  const saveReport = async () => {
    if (!linkedListingId) {
      alert("Выберите объявление для привязки отчёта");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/inspection-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: parseInt(linkedListingId),
        ...scores,
        bodyPanels: panels,
        hasAccident,
        accidentDetails: hasAccident ? accidentDetails : null,
        mileageVerified,
        inspectorNotes,
        inspectorName,
        inspectedAt,
      }),
    });
    if (res.ok) {
      await patch({ status: "inspected", listingId: parseInt(linkedListingId) });
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Status actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Управление заявкой</h3>

        <div className="space-y-3">
          {/* Schedule */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Дата и время записи</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => patch({ status: "scheduled", scheduledAt: scheduledAt || null })}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
            Запланировать
          </button>

          {request.status !== "cancelled" && (
            <button
              onClick={() => patch({ status: "cancelled" })}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Отменить заявку
            </button>
          )}
        </div>
      </div>

      {/* Link listing */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4" /> Привязать объявление
        </h3>
        <select
          value={linkedListingId}
          onChange={(e) => setLinkedListingId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
        >
          <option value="">— выберите объявление —</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>
              #{l.id} {l.brand} {l.model} {l.year} · {l.sellerName}
            </option>
          ))}
        </select>
        {linkedListingId && !showReportForm && (
          <button
            onClick={() => setShowReportForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            {existingReport ? "Редактировать отчёт" : "Заполнить отчёт осмотра"}
          </button>
        )}
      </div>

      {/* Inspection report form */}
      {showReportForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Отчёт осмотра</h3>
            <button onClick={() => setShowReportForm(false)} className="text-gray-400 hover:text-gray-600">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Дата осмотра</label>
            <input
              type="date"
              value={inspectedAt}
              onChange={(e) => setInspectedAt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Component scores */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Состояние узлов</p>
            <div className="space-y-3">
              {COMPONENTS.map((c) => (
                <div key={c.key} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-700 flex-shrink-0">{c.label}</div>
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setScores((p) => ({ ...p, [c.key]: v }))}
                        className={`flex-1 h-7 rounded text-xs font-semibold transition-colors ${
                          scores[c.key] === v
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className={`text-xs w-20 text-right ${SCORE_LABELS[scores[c.key]]?.color}`}>
                    {SCORE_LABELS[scores[c.key]]?.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body panels */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Состояние кузова</p>
            <div className="space-y-2">
              {BODY_PANELS.map((p) => (
                <div key={p.key} className="flex items-center gap-2">
                  <div className="w-36 text-xs text-gray-700 flex-shrink-0">{p.label}</div>
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setPanels((prev) => ({ ...prev, [p.key]: v }))}
                        className={`flex-1 h-6 rounded text-xs font-semibold transition-colors ${
                          panels[p.key] === v
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accident & mileage */}
          <div className="mb-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAccident}
                onChange={(e) => setHasAccident(e.target.checked)}
                className="w-4 h-4 rounded text-red-500"
              />
              <span className="text-sm text-gray-700">Есть следы ДТП</span>
            </label>
            {hasAccident && (
              <textarea
                value={accidentDetails}
                onChange={(e) => setAccidentDetails(e.target.value)}
                rows={2}
                placeholder="Описание повреждений..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mileageVerified}
                onChange={(e) => setMileageVerified(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500"
              />
              <span className="text-sm text-gray-700">Пробег подтверждён</span>
            </label>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Заметки инспектора</label>
            <textarea
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              rows={3}
              placeholder="Дополнительные наблюдения, замечания..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <button
            onClick={saveReport}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Сохранить отчёт
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Объявление автоматически получит статус «Проверено»
          </p>
        </div>
      )}
    </div>
  );
}
