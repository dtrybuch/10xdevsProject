import { useState } from "react";
import type { FlashcardDTO } from "../../types";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface EditFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flashcard: FlashcardDTO) => void;
  flashcard: FlashcardDTO;
}

export default function EditFlashcardDialog({
  isOpen,
  onClose,
  onSave,
  flashcard,
}: EditFlashcardDialogProps) {
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { front?: string; back?: string } = {};
    
    if (!front.trim()) {
      newErrors.front = "Przód fiszki nie może być pusty";
    } else if (front.length > 200) {
      newErrors.front = "Przód fiszki nie może być dłuższy niż 200 znaków";
    }
    
    if (!back.trim()) {
      newErrors.back = "Tył fiszki nie może być pusty";
    } else if (back.length > 500) {
      newErrors.back = "Tył fiszki nie może być dłuższy niż 500 znaków";
    }
    
    setErrors(newErrors);
    
    // If there are no errors, save the flashcard
    if (Object.keys(newErrors).length === 0) {
      onSave({
        ...flashcard,
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
            <DialogTitle>Edytuj fiszkę</DialogTitle>
            <DialogDescription>
              Zmodyfikuj zawartość fiszki i zatwierdź zmiany.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="front">
                Przód 
                <span className="text-xs text-muted-foreground ml-1">
                  (max 200 znaków)
                </span>
              </Label>
              <Input
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Wpisz przód fiszki"
                className={errors.front ? "border-destructive" : ""}
              />
              {errors.front && (
                <p className="text-sm text-destructive">{errors.front}</p>
              )}
              <div className="text-xs text-muted-foreground text-right">
                {front.length}/200
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">
                Tył 
                <span className="text-xs text-muted-foreground ml-1">
                  (max 500 znaków)
                </span>
              </Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Wpisz tył fiszki"
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
              Anuluj
            </Button>
            <Button type="submit">Zapisz zmiany</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 