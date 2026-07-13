export function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 rounded-2xl bg-muted"
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="h-32 rounded-2xl bg-muted animate-pulse" />
  );
}
