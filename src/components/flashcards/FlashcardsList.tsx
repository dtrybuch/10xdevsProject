import { useState } from "react";
import type { FlashcardDTO } from "../../types";
import EmptyState from "./EmptyState";
import FlashcardItem from "./FlashcardItem";
import Pagination from "./Pagination";
import useFlashcards from "../hooks/useFlashcards";
import { Card } from "../ui/card";
import DeleteFlashcardDialog from "./DeleteFlashcardDialog";
import EditFlashcardDialog from "./EditFlashcardDialog";

interface FlashcardsListProps {
  initialPage?: number;
  initialPageSize?: number;
}

export default function FlashcardsList({
  initialPage = 1,
  initialPageSize = 10,
}: FlashcardsListProps) {
  const {
    flashcards,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    isLoading,
    error,
    handlePageChange,
    handlePageSizeChange,
    updateFlashcard,
    deleteFlashcard,
    refreshFlashcards
  } = useFlashcards(initialPage, initialPageSize);

  const [flashcardToEdit, setFlashcardToEdit] = useState<FlashcardDTO | null>(null);
  const [flashcardToDelete, setFlashcardToDelete] = useState<FlashcardDTO | null>(null);

  const handleEditClick = (flashcard: FlashcardDTO) => {
    setFlashcardToEdit(flashcard);
  };

  const handleDeleteClick = (flashcard: FlashcardDTO) => {
    setFlashcardToDelete(flashcard);
  };

  const handleEditDialogClose = () => {
    setFlashcardToEdit(null);
  };

  const handleDeleteDialogClose = () => {
    setFlashcardToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (flashcardToDelete) {
      const success = await deleteFlashcard(flashcardToDelete.id);
      if (success) {
        setFlashcardToDelete(null);
      }
    }
  };

  const handleSaveEdit = async (updatedFlashcard: FlashcardDTO) => {
    const success = await updateFlashcard(updatedFlashcard);
    if (success) {
      setFlashcardToEdit(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <p>Wystąpił błąd: {error}</p>
        <button 
          onClick={refreshFlashcards}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <Card className="shadow-sm">
        <div className="divide-y">
          {flashcards.map((flashcard: FlashcardDTO) => (
            <FlashcardItem 
              key={flashcard.id} 
              flashcard={flashcard} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      </Card>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {flashcardToEdit && (
        <EditFlashcardDialog
          isOpen={!!flashcardToEdit}
          onClose={handleEditDialogClose}
          onSave={handleSaveEdit}
          flashcard={flashcardToEdit}
        />
      )}

      {flashcardToDelete && (
        <DeleteFlashcardDialog
          isOpen={!!flashcardToDelete}
          onClose={handleDeleteDialogClose}
          onConfirm={handleDeleteConfirm}
          flashcard={flashcardToDelete}
        />
      )}
    </div>
  );
} 