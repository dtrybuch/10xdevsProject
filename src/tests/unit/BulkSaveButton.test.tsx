import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BulkSaveButton } from '../../components/BulkSaveButton';
import { toast } from 'sonner';
import '@testing-library/jest-dom/vitest';
import type { FlashcardProposalDTO } from '@/types';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());

describe('BulkSaveButton', () => {
  const user = userEvent.setup();
  
  const mockProposals = [
    { front: 'Question 1', back: 'Answer 1', type: 'ai' as const, status: 'accepted' as const },
    { front: 'Question 2', back: 'Answer 2', type: 'ai' as const, status: 'edited' as const }
  ];
  
  const mockOnSaveComplete = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementation for fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 1 })
    });
  });
  
  it('renders with correct label showing accepted count', () => {
    render(
      <BulkSaveButton 
        selectedProposals={mockProposals} 
        onSaveComplete={mockOnSaveComplete}
      />
    );
    
    // Button should show the count of accepted proposals
    expect(screen.getByRole('button')).toHaveTextContent('Save 2 Flashcards');
  });
  
  it('does not save when there are no accepted proposals', () => {
    const emptyProposals: FlashcardProposalDTO[] = [];
    
    render(
      <BulkSaveButton 
        selectedProposals={emptyProposals} 
        onSaveComplete={mockOnSaveComplete}
      />
    );
    
    // Button should be disabled when no proposals are accepted
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('shows progress during save operation', async () => {
    // Mock a delayed fetch response
    global.fetch = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ id: 1 })
          });
        }, 100);
      });
    });
    
    render(
      <BulkSaveButton 
        selectedProposals={mockProposals} 
        onSaveComplete={mockOnSaveComplete}
      />
    );
    
    // Click save button
    await user.click(screen.getByRole('button'));
    
    // Button should show saving state
    expect(screen.getByRole('button')).toHaveTextContent(/Saving/i);
    
    // Should show progress
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/\d+%/i);
    });
  });
  
  it('saves proposals and calls onSaveComplete callback', async () => {
    render(
      <BulkSaveButton 
        selectedProposals={mockProposals} 
        onSaveComplete={mockOnSaveComplete}
      />
    );
    
    // Click save button
    await user.click(screen.getByRole('button'));
    
    // Wait for saving to complete
    await waitFor(() => {
      // Verify fetch was called twice (once for each proposal)
      expect(fetch).toHaveBeenCalledTimes(2);
      
      // Verify both proposals were saved with correct data
      expect(fetch).toHaveBeenCalledWith(
        '/api/flashcards/createFlashcard',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String)
        })
      );
      
      // Verify success toast was shown
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Successfully saved')
      );
      
      // Verify onSaveComplete was called
      expect(mockOnSaveComplete).toHaveBeenCalledTimes(1);
    });
  });
  
  it('handles API errors during save', async () => {
    // Mock a failed API call
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ message: 'Server error' })
    }).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 2 })
    });
    
    render(
      <BulkSaveButton 
        selectedProposals={mockProposals} 
        onSaveComplete={mockOnSaveComplete}
      />
    );
    
    // Click save button
    await user.click(screen.getByRole('button'));
    
    // Wait for saving to complete
    await waitFor(() => {
      // Verify error toast was shown
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to save flashcard',
        expect.objectContaining({
          description: expect.any(String)
        })
      );
      
      // Verify success toast was still shown for the second successful save
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Successfully saved')
      );
      
      // Verify onSaveComplete was called
      expect(mockOnSaveComplete).toHaveBeenCalledTimes(1);
    });
  });
}); 