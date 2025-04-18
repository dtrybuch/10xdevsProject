import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function GenerateButton({ onClick, disabled }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto"
      size="lg"
    >
      {disabled ? (
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