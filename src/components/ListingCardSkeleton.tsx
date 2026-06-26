export default function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-3.5 bg-gray-100 rounded" />
          <div className="h-3.5 bg-gray-100 rounded" />
          <div className="h-3.5 bg-gray-100 rounded" />
          <div className="h-3.5 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
