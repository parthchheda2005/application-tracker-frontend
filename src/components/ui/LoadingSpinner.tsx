import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
