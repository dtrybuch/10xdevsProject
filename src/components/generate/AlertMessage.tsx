import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface AlertMessageProps {
  message: string;
  type: "error" | "info";
  'data-test-id'?: string;
}

export function AlertMessage({ message, type, 'data-test-id': testId }: AlertMessageProps) {
  const isError = type === "error";
  
  return (
    <Alert variant={isError ? "destructive" : "default"} data-test-id={testId}>
      {isError ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Info className="h-4 w-4" />
      )}
      <AlertTitle>
        {isError ? "Error" : "Information"}
      </AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
} 