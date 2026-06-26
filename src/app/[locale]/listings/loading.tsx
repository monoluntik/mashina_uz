import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCardSkeleton from "@/components/ListingCardSkeleton";

export default function ListingsLoading() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Sidebar skeleton */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 animate-pulse">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-9 bg-gray-100 rounded-lg" />
                  </div>
                ))}
              </div>
            </aside>
            {/* Cards skeleton */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <div className="space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-40 animate-pulse" />
                  <div className="h-3.5 bg-gray-100 rounded w-24 animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
