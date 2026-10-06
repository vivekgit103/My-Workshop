export function LoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        {/* Animated Sprout SVG SVG Skeleton */}
        <svg 
          className="mx-auto h-16 w-16 text-agri-500 animate-pulse" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
          />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-slate-900 tracking-tight">AI is analyzing...</h3>
        <p className="mt-1 text-sm text-slate-500">
          Synthesizing agronomic models and computing exact interventions.
        </p>
      </div>
    </div>
  );
}
