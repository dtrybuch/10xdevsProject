import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { FlashcardProposalDTO } from "@/types";

interface BulkSaveButtonProps {
  selectedProposals: FlashcardProposalDTO[];
  onSaveComplete?: () => void;
}

export function BulkSaveButton({ selectedProposals, onSaveComplete }: BulkSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSave = async () => {
    setIsSaving(true);
    setProgress(0);

    try {
      const total = selectedProposals.length;
      let saved = 0;

      for (const proposal of selectedProposals) {
        if (proposal.status !== "accepted" && proposal.status !== "edited") continue;

        try {
          const response = await fetch("/api/flashcards/createFlashcard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              front: proposal.front,
              back: proposal.back,
              type: "AI",
              knowledge_status: "new",
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to save flashcard: ${response.statusText}`);
          }

          saved++;
          setProgress(Math.round((saved / total) * 100));
        } catch (error) {
          toast.error("Failed to save flashcard", {
            description: error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
      }

      if (saved > 0) {
        toast.success(`Successfully saved ${saved} flashcard(s)`);
        onSaveComplete?.();
      }
    } catch (error) {
      toast.error("Failed to save flashcards", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
      setProgress(0);
    }
  };

  const acceptedCount = selectedProposals.filter((p) => p.status === "accepted" || p.status === "edited").length;

  return (
    <Button className="w-full" onClick={handleSave} disabled={isSaving || acceptedCount === 0}>
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving... {progress}%
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save {acceptedCount} Flashcard{acceptedCount !== 1 ? "s" : ""}
        </>
      )}
    </Button>
  );
}
