import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInputArea({ value, onChange }: TextInputAreaProps) {
  const charCount = value.length;
  const isValid = charCount >= 1000 && charCount <= 10000;
  const remainingChars = 10000 - charCount;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your text here (1,000 - 10,000 characters)"
        className="min-h-[200px]"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{charCount} characters</span>
        <span>{remainingChars >= 0 ? `${remainingChars} remaining` : `${Math.abs(remainingChars)} over limit`}</span>
      </div>
      {!isValid && charCount > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            {charCount < 1000
              ? `Please enter at least ${1000 - charCount} more characters`
              : `Please remove ${charCount - 10000} characters`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 