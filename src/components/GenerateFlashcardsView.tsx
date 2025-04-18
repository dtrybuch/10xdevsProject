import { useState } from 'react';
import { AlertMessage } from './AlertMessage';
import { TextInputArea } from './TextInputArea';
import { GenerateButton } from './GenerateButton';
import { SkeletonLoader } from './SkeletonLoader';
import { FlashcardProposalList } from './FlashcardProposalList';
import { BulkSaveButton } from './BulkSaveButton';
import { toast } from "sonner";
import type { GenerationCreateResponseDto, FlashcardProposalDTO } from '@/types';

interface GenerateViewState {
  inputText: string;
  isLoading: boolean;
  error: {
    message: string;
  } | null;
  proposals: FlashcardProposalDTO[];
  stats: {
    acceptedCount: number;
    editedCount: number;
    rejectedCount: number;
    sessionDuration: string;
  } | null;
}

const TIMEOUT_MS = 60000; // 60 seconds

export function GenerateFlashcardsView() {
  const [state, setState] = useState<GenerateViewState>({
    inputText: '',
    isLoading: false,
    error: null,
    proposals: [],
    stats: null
  });

  const handleGenerateFlashcards = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: state.inputText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: GenerationCreateResponseDto = await response.json();
      setState(prev => ({
        ...prev,
        isLoading: false,
        proposals: data.flashcards_proposal
      }));

      toast.success(`Generated ${data.generated_count} flashcard proposals`);

    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          message: error instanceof Error 
            ? error.message 
            : error instanceof DOMException && error.name === 'AbortError'
            ? 'Request timed out after 60 seconds'
            : 'An unexpected error occurred'
        }
      }));
    }
  };

  const handleStatsChange = (stats: GenerateViewState['stats']) => {
    setState(prev => ({ ...prev, stats }));
  };

  const handleSaveComplete = () => {
    setState(prev => ({ ...prev, proposals: [] }));
    toast.success('All flashcards have been saved successfully');
  };

  return (
    <div className="space-y-6">
      <TextInputArea 
        value={state.inputText}
        onChange={(text: string) => setState(prev => ({ ...prev, inputText: text }))}
      />
      
      <GenerateButton
        onClick={handleGenerateFlashcards}
        disabled={state.inputText.length < 1000 || state.inputText.length > 10000}
        isLoading={state.isLoading}
      />

      {state.isLoading && <SkeletonLoader />}

      {state.error && (
        <AlertMessage
          message={state.error.message}
          type="error"
        />
      )}

      {state.proposals.length > 0 && (
        <>
          <FlashcardProposalList 
            proposals={state.proposals}
            onProposalsChange={(proposals) => setState(prev => ({ ...prev, proposals }))}
            onStatsChange={handleStatsChange}
          />
          <BulkSaveButton 
            selectedProposals={state.proposals}
            onSaveComplete={handleSaveComplete}
          />
        </>
      )}
    </div>
  );
} 