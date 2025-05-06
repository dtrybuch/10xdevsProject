import { useState } from "react";
import type { FlashcardDTO } from "../../types";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";

interface FlashcardItemProps {
  flashcard: FlashcardDTO;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcard: FlashcardDTO) => void;
}

export default function FlashcardItem({ flashcard, onEdit, onDelete }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <CardContent className="p-4">
      <div 
        className="cursor-pointer"
        onClick={toggleFlip}
      >
        <div className="flex flex-col gap-4">
          <div className="min-h-24">
            {isFlipped ? (
              <div className="bg-muted/20 p-3 rounded-md">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Tył:</h3>
                <p className="text-base">{flashcard.back}</p>
              </div>
            ) : (
              <div className="bg-muted/10 p-3 rounded-md">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Przód:</h3>
                <p className="text-base">{flashcard.front}</p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="capitalize">Typ: {flashcard.type}</span>
              {flashcard.knowledge_status && (
                <span className="border px-2 py-0.5 rounded-full text-xs">
                  Status: {flashcard.knowledge_status}
                </span>
              )}
            </div>
            
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(flashcard)}
              >
                Edytuj
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(flashcard)}
              >
                Usuń
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  );
} 