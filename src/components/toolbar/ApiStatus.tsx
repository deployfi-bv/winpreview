export function ApiStatus() {
  return (
    <div
      className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground"
      title="Backend API: Not connected (UI-only mode)"
    >
      <div className="size-2 rounded-full bg-muted-foreground" />
      <span className="hidden sm:inline">Offline</span>
    </div>
  );
}
