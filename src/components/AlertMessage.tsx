import { Alert, AlertDescription } from "@/components/ui/alert";

interface AlertMessageProps {
  message: string;
  type: "error" | "info" | "warning" | "success";
}

export function AlertMessage({ message, type }: AlertMessageProps) {
  return (
    <Alert variant={type === "error" ? "destructive" : "default"}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
