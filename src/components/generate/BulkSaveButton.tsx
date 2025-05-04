import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import type { FlashcardProposalDTO } from "@/types";

interface BulkSaveButtonProps {
  selectedProposals: FlashcardProposalDTO[];
  onBulkSaveComplete: () => void;
  'data-test-id'?: string;
}

export function BulkSaveButton({ 
  selectedProposals, 
  onBulkSaveComplete,
  'data-test-id': testId
}: BulkSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBulkSave = async () => {
    if (selectedProposals.length === 0) return;

    setIsSaving(true);
    setProgress(0);

    try {
      // Save flashcards one by one and track progress
      for (let i = 0; i < selectedProposals.length; i++) {
        const proposal = selectedProposals[i];
        
        await fetch('/api/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            front: proposal.front,
            back: proposal.back,
            type: proposal.type,
          }),
        });

        setProgress(Math.round(((i + 1) / selectedProposals.length) * 100));
      }

      onBulkSaveComplete();
    } catch (error) {
      console.error('Failed to save flashcards:', error);
    } finally {
      setIsSaving(false);
      setProgress(0);
    }
  };

  if (selectedProposals.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white p-4 rounded-lg shadow-lg">
      {isSaving && (
        <span className="text-sm text-gray-600">
          Saving... {progress}%
        </span>
      )}
      <Button
        onClick={handleBulkSave}
        disabled={isSaving}
        size="lg"
        data-test-id={testId}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Flashcards...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save {selectedProposals.length} Flashcard{selectedProposals.length === 1 ? '' : 's'}
          </>
        )}
      </Button>
    </div>
  );
} 