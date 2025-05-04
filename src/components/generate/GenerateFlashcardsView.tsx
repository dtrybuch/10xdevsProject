import { useState } from 'react';
import type { FlashcardProposalDTO, GenerationCreateResponseDto } from '@/types';
import { TextInputArea } from './TextInputArea';
import { GenerateButton } from './GenerateButton';
import { SkeletonLoader } from './SkeletonLoader';
import { FlashcardProposalList } from './FlashcardProposalList';
import { AlertMessage } from './AlertMessage';
import { BulkSaveButton } from './BulkSaveButton';

// View model for the generate view state
type GenerateViewState = {
  inputText: string;
  isLoading: boolean;
  error: string | null;
  proposals: FlashcardProposalDTO[];
};

export function GenerateFlashcardsView() {
  // State management using useState hooks
  const [state, setState] = useState<GenerateViewState>({
    inputText: '',
    isLoading: false,
    error: null,
    proposals: [],
  });

  // Handler for text input changes
  const handleTextChange = (text: string) => {
    setState(prev => ({ ...prev, inputText: text }));
  };

  // Text validation function
  const validateInputText = (text: string): string | null => {
    if (text.length < 1000) {
      return 'Text must be at least 1000 characters long';
    }
    if (text.length > 10000) {
      return 'Text cannot exceed 10000 characters';
    }
    return null;
  };

  // Handler for generate button click
  const handleGenerate = async () => {
    if (state.inputText.length < 1000 || state.inputText.length > 10000) {
      setState(prev => ({
        ...prev,
        error: 'Text must be between 1000 and 10000 characters'
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: state.inputText })
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data: GenerationCreateResponseDto = await response.json();
      setState(prev => ({
        ...prev,
        isLoading: false,
        proposals: data.flashcards_proposal
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate flashcards'
      }));
    }
  };

  // Handler for accepting a flashcard proposal
  const handleAcceptProposal = async (proposal: FlashcardProposalDTO) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front: proposal.front,
          back: proposal.back,
          type: proposal.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save flashcard');
      }

      // Remove the accepted proposal from the list
      setState(prev => ({
        ...prev,
        proposals: prev.proposals.filter(p => p !== proposal),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save flashcard',
      }));
    }
  };

  return (
    <div className="space-y-6" data-test-id="flashcards-generator-view">
      <TextInputArea
        value={state.inputText}
        onChange={handleTextChange}
        errorMessage={state.error}
        data-test-id="input-text-area"
      />
      
      <GenerateButton
        onClick={handleGenerate}
        disabled={!!state.error || state.inputText.length < 1000 || state.isLoading}
        isLoading={state.isLoading}
        data-test-id="generate-flashcards-button"
      />

      {state.error && (
        <AlertMessage 
          message={state.error} 
          type="error" 
          data-test-id="error-message"
        />
      )}

      {state.isLoading && <SkeletonLoader data-test-id="loading-indicator" />}

      {state.proposals.length > 0 && (
        <>
          <FlashcardProposalList
            proposals={state.proposals}
            onAccept={handleAcceptProposal}
            onEdit={(proposal) => {
              setState(prev => ({
                ...prev,
                proposals: prev.proposals.map(p => 
                  p === proposal ? { ...proposal, status: 'edited' } : p
                )
              }));
            }}
            onReject={(proposal) => {
              setState(prev => ({
                ...prev,
                proposals: prev.proposals.filter(p => p !== proposal),
              }));
            }}
            data-test-id="flashcard-proposal-list"
          />
          <BulkSaveButton
            selectedProposals={state.proposals}
            onBulkSaveComplete={() => {
              setState(prev => ({ ...prev, proposals: [] }));
            }}
            data-test-id="save-flashcards-button"
          />
        </>
      )}
    </div>
  );
} 