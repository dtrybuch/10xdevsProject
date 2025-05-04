import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import type { FlashcardProposalDTO } from "@/types";

interface EditFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedProposal: FlashcardProposalDTO) => void;
  proposal: FlashcardProposalDTO;
}

export function EditFlashcardDialog({
  isOpen,
  onClose,
  onSave,
  proposal,
}: EditFlashcardDialogProps) {
  const [front, setFront] = useState(proposal.front);
  const [back, setBack] = useState(proposal.back);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog is opened with a new proposal
  useEffect(() => {
    if (isOpen) {
      setFront(proposal.front);
      setBack(proposal.back);
      setError(null);
    }
  }, [isOpen, proposal]);

  const handleSave = () => {
    if (front.length > 200) {
      setError("Front side must not exceed 200 characters");
      return;
    }
    if (back.length > 500) {
      setError("Back side must not exceed 500 characters");
      return;
    }
    if (front.length === 0 || back.length === 0) {
      setError("Both sides must not be empty");
      return;
    }

    onSave({ ...proposal, front, back });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogPortal>
        <DialogContent data-test-id="edit-flashcard-dialog" className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="front" className="text-sm font-medium">
                Front Side <span className="text-muted-foreground">({front.length}/200)</span>
              </label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => {
                  setFront(e.target.value);
                  setError(null);
                }}
                placeholder="Enter front side text"
                className="min-h-[100px]"
                data-test-id="edit-front-textarea"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="back" className="text-sm font-medium">
                Back Side <span className="text-muted-foreground">({back.length}/500)</span>
              </label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => {
                  setBack(e.target.value);
                  setError(null);
                }}
                placeholder="Enter back side text"
                className="min-h-[150px]"
                data-test-id="edit-back-textarea"
              />
            </div>
            {error && (
              <Alert variant="destructive" data-test-id="edit-error-alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} data-test-id="edit-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleSave} data-test-id="edit-save-button">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
} 