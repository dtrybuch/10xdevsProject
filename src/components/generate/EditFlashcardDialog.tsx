import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { FlashcardProposalDTO } from "@/types";

interface EditFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedProposal: FlashcardProposalDTO) => void;
  proposal: FlashcardProposalDTO;
}

export function EditFlashcardDialog({ isOpen, onClose, onSave, proposal }: EditFlashcardDialogProps) {
  const [front, setFront] = useState(proposal.front);
  const [back, setBack] = useState(proposal.back);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { front?: string; back?: string } = {};
    
    if (!front.trim()) {
      newErrors.front = "Front side cannot be empty";
    } else if (front.length > 200) {
      newErrors.front = "Front side must not exceed 200 characters";
    }
    
    if (!back.trim()) {
      newErrors.back = "Back side cannot be empty";
    } else if (back.length > 500) {
      newErrors.back = "Back side must not exceed 500 characters";
    }
    
    setErrors(newErrors);
    
    // If there are no errors, save the proposal
    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...proposal,
        front,
        back,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>
              Modify the flashcard content and save your changes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="front" className="text-sm font-medium">
                Front Side 
                <span className="text-xs text-muted-foreground ml-1">
                  (max 200 characters)
                </span>
              </label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Enter front side text"
                className={errors.front ? "border-destructive" : ""}
                rows={3}
              />
              {errors.front && (
                <p className="text-sm text-destructive">{errors.front}</p>
              )}
              <div className="text-xs text-muted-foreground text-right">
                {front.length}/200
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="back" className="text-sm font-medium">
                Back Side 
                <span className="text-xs text-muted-foreground ml-1">
                  (max 500 characters)
                </span>
              </label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Enter back side text"
                className={errors.back ? "border-destructive" : ""}
                rows={4}
              />
              {errors.back && (
                <p className="text-sm text-destructive">{errors.back}</p>
              )}
              <div className="text-xs text-muted-foreground text-right">
                {back.length}/500
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
