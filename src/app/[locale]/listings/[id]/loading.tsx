import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ListingDetailLoading() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {/* Gallery skeleton */}
              <div className="h-96 bg-gray-200 rounded-xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                ))}
              </div>
              {/* Specs skeleton */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-100 rounded" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {/* Price box skeleton */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-11 bg-gray-200 rounded-xl" />
                <div className="h-11 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
