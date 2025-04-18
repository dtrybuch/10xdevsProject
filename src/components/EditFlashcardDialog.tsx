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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Front Side <span className="text-muted-foreground">({front.length}/200)</span>
              </label>
              <Textarea
                value={front}
                onChange={(e) => {
                  setFront(e.target.value);
                  setError(null);
                }}
                placeholder="Enter front side text"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Back Side <span className="text-muted-foreground">({back.length}/500)</span>
              </label>
              <Textarea
                value={back}
                onChange={(e) => {
                  setBack(e.target.value);
                  setError(null);
                }}
                placeholder="Enter back side text"
                className="min-h-[150px]"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
} 