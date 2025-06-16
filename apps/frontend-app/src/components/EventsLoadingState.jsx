// src/components/LoadingState.js
export default function LoadingState() {
  return (
    <div className="mx-auto max-w-[95%] sm:max-w-3xl md:max-w-4xl lg:max-w-6xl px-2 mt-23">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 text-center shadow-lg animate-pulse mb-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-lg mx-auto mb-4 w-64"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-lg mx-auto w-80"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Loading */}
      <div className="space-y-6">
        {/* Results Info Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Event Card Skeleton Component
function EventCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-300 dark:bg-gray-700"></div>

      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>

        {/* Price Section Skeleton */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}
