// src/components/ui/PageSkeleton.jsx
export default function PageSkeleton() {
  return (
    <div className="p-6">
      <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse mb-6" />
      <div className="h-4 w-80 rounded bg-white/5 animate-pulse mb-3" />
      <div className="h-4 w-64 rounded bg-white/5 animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
