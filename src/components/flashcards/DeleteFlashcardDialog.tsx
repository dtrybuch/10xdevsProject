import type { FlashcardDTO } from "../../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface DeleteFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  flashcard: FlashcardDTO;
}

export default function DeleteFlashcardDialog({
  isOpen,
  onClose,
  onConfirm,
  flashcard,
}: DeleteFlashcardDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć tę fiszkę?</AlertDialogTitle>
          <AlertDialogDescription>
            Ta akcja jest nieodwracalna. Fiszka zostanie trwale usunięta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="p-4 border rounded-md bg-muted/20 my-2">
          <div className="mb-2">
            <h3 className="font-medium text-sm text-muted-foreground">Przód:</h3>
            <p className="text-sm">{flashcard.front}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Tył:</h3>
            <p className="text-sm">{flashcard.back}</p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 