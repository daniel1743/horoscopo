import { Skeleton } from "@/components/ui/skeleton";

export function MoonTodaySkeleton() {
  return (
    <div className="grid gap-8 rounded-[var(--radius-card-lg)] bg-night p-6 md:grid-cols-[0.8fr_1.2fr] md:p-10">
      <Skeleton className="mx-auto aspect-square w-full max-w-[240px] rounded-full bg-white/10" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-40 bg-white/10" />
        <Skeleton className="h-10 w-64 bg-white/10" />
        <Skeleton className="h-4 w-full bg-white/10" />
        <Skeleton className="h-4 w-3/4 bg-white/10" />
      </div>
    </div>
  );
}

export function MoonCalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-[var(--radius-card)]" />
      ))}
    </div>
  );
}
