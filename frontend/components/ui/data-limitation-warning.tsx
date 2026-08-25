import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DataLimitationWarningProps {
  children?: React.ReactNode;
  title?: string;
}

export function DataLimitationWarning({
  children,
  title = "هشدار محدودیت داده",
}: DataLimitationWarningProps) {
  return (
    <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200 font-medium">
        {title}
      </AlertTitle>
      <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
        {children}
      </AlertDescription>
    </Alert>
  );
}
