import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface AlertMessageProps {
  message: string;
  type: "error" | "info";
}

export function AlertMessage({ message, type }: AlertMessageProps) {
  const isError = type === "error";
  
  return (
    <Alert variant={isError ? "destructive" : "default"}>
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