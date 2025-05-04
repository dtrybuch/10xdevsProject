import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  'data-test-id'?: string;
}

export function GenerateButton({ onClick, disabled, isLoading, 'data-test-id': testId }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full"
      data-test-id={testId}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Generate Flashcards'
      )}
    </Button>
  );
} 