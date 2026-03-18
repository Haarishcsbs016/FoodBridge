import { Package } from "lucide-react";

export const EmptyState = ({ message = "No listings found" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card py-16 text-center">
    <Package className="mb-3 h-12 w-12 text-muted-foreground/40" />
    <p className="text-sm font-medium text-muted-foreground">{message}</p>
  </div>
);
