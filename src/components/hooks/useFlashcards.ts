import { useState, useEffect, useCallback } from "react";
import type { FlashcardDTO } from "../../types";

function useFlashcards(initialPage = 1, initialPageSize = 10) {
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/flashcards/getFlashcards?page=${currentPage}&pageSize=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Wystąpił problem podczas pobierania fiszek');
      }
      
      const data = await response.json();
      setFlashcards(data.flashcards);
      setTotalItems(data.totalItems || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      setFlashcards([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  // Efekt pobierający dane przy zmianie strony lub liczby elementów
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Funkcje do zarządzania paginacją
  const handlePageChange = (page: number) => {
    if (page > 0) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (size > 0 && size <= 100) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  // Funkcja do usuwania fiszki
  const deleteFlashcard = async (id: number) => {
    try {
      const response = await fetch(`/api/flashcards/deleteFlashcard?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się usunąć fiszki');
      }
      
      // Odświeżenie listy po usunięciu
      fetchFlashcards();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd podczas usuwania');
      return false;
    }
  };

  // Wyliczenie całkowitej liczby stron
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  return {
    flashcards,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    isLoading,
    error,
    handlePageChange,
    handlePageSizeChange,
    deleteFlashcard,
    refreshFlashcards: fetchFlashcards
  };
}

export default useFlashcards; 