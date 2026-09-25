export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}
