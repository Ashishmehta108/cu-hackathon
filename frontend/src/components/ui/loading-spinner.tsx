import { cn } from "@/lib/utils";
import { Refresh2 } from "iconsax-react";

export function LoadingSpinner({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12", className)}>
      <Refresh2 className="h-8 w-8 animate-spin text-primary" variant="Linear" color="currentColor" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
