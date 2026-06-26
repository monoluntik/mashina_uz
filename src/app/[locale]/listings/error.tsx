"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ListingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Что-то пошло не так</h2>
      <p className="text-gray-500 mb-6 max-w-sm">Не удалось загрузить объявления. Попробуйте ещё раз или вернитесь на главную.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Попробовать снова
        </button>
        <Link
          href="/ru"
          className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
