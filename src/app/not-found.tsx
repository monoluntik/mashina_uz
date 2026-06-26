import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl font-black text-blue-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Страница не найдена</h1>
          <p className="text-gray-500 mb-8">Такой страницы не существует или она была удалена.</p>
          <Link
            href="/ru"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            На главную
          </Link>
        </div>
      </body>
    </html>
  );
}
