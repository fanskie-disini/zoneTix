// src/components/HomeLoadingState.js
export default function HomeLoadingState() {
    return (
      <main className="mx-auto max-w-[95%] sm:max-w-3xl md:max-w-4xl lg:max-w-6xl px-2 mt-23">
        {/* Header Skeleton */}
        <div className="mb-4 flex items-center">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-40 animate-pulse"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 ml-4 animate-pulse"></div>
        </div>
  
        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <HomeEventCardSkeleton key={index} />
          ))}
        </div>
      </main>
    );
  }
  
  // Home Event Card Skeleton Component
  function HomeEventCardSkeleton() {
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