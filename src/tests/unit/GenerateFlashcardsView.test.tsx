import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GenerateFlashcardsView } from '../../components/GenerateFlashcardsView';
import { toast } from 'sonner';
import type { GenerationCreateResponseDto } from '@/types';
import '@testing-library/jest-dom/vitest';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock BulkSaveButton to avoid infinite re-render issues
vi.mock('../../components/BulkSaveButton', () => ({
  BulkSaveButton: ({ onSaveComplete }: { onSaveComplete?: () => void }) => {
    return (
      <button 
        data-testid="bulk-save-button"
        onClick={() => onSaveComplete?.()}
      >
        Save
      </button>
    );
  }
}));

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());

describe('GenerateFlashcardsView', () => {
  const user = userEvent.setup();
  const mockProposals = [
    { front: 'Test Question 1', back: 'Test Answer 1', type: 'ai' as const },
    { front: 'Test Question 2', back: 'Test Answer 2', type: 'ai' as const }
  ];

  const mockResponse: GenerationCreateResponseDto = {
    generation_id: 1,
    flashcards_proposal: mockProposals,
    generated_count: 2
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Default mock implementation for fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse)
    });
  });

  it('renders the text input area', () => {
    render(<GenerateFlashcardsView />);
    
    expect(screen.getByPlaceholderText(/Enter your text here/i)).toBeInTheDocument();
  });

  it('disables generate button when text is too short', async () => {
    render(<GenerateFlashcardsView />);
    
    const textArea = screen.getByPlaceholderText(/Enter your text here/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });
    
    expect(generateButton).toBeDisabled();
    
    await user.type(textArea, 'This text is too short');
    
    expect(generateButton).toBeDisabled();
  });

  it('enables generate button when text is valid length', async () => {
    render(<GenerateFlashcardsView />);
    
    const textArea = screen.getByPlaceholderText(/Enter your text here/i);
    const generateButton = screen.getByRole('button', { name: /generate/i });
    
    // Generate a string with valid length (1000+ characters)
    const validText = 'A'.repeat(1000);
    
    await user.type(textArea, validText);
    
    expect(generateButton).not.toBeDisabled();
  });

  it('shows loading state during API call', async () => {
    // Delay the fetch response
    global.fetch = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve(mockResponse)
          });
        }, 100);
      });
    });

    render(<GenerateFlashcardsView />);
    
    const textArea = screen.getByPlaceholderText(/Enter your text here/i);
    await user.type(textArea, 'A'.repeat(1000));
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);
    
    // Check if loading indicator appears
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('displays flashcard proposals after successful generation', async () => {
    render(<GenerateFlashcardsView />);
    
    const textArea = screen.getByPlaceholderText(/Enter your text here/i);
    await user.type(textArea, 'A'.repeat(1000));
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);
    
    // Wait for the proposals to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
      expect(screen.getByText('Test Answer 1')).toBeInTheDocument();
      expect(screen.getByText('Test Question 2')).toBeInTheDocument();
      expect(screen.getByText('Test Answer 2')).toBeInTheDocument();
    });
    
    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Generated 2 flashcard proposals'));
  });

  it('displays error message when API call fails', async () => {
    // Mock a failed API call
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ message: 'Server error' })
    });

    render(<GenerateFlashcardsView />);
    
    const textArea = screen.getByPlaceholderText(/Enter your text here/i);
    await user.type(textArea, 'A'.repeat(1000));
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it('handles request timeout properly', async () => {
    // Mock an AbortError
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    global.fetch = vi.fn().mockRejectedValue(abortError);

    render(<GenerateFlashcardsView />);
    
    const textArea = screen.getByPlaceholderText(/Enter your text here/i);
    await user.type(textArea, 'A'.repeat(1000));
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);
    
    // Wait for the timeout error message
    await waitFor(() => {
      expect(screen.getByText(/Request timed out after 60 seconds/i)).toBeInTheDocument();
    });
  });

  it('clears proposals after bulk save completion', async () => {
    render(<GenerateFlashcardsView />);
    
    // Add proposals first
    const textArea = screen.getByPlaceholderText(/Enter your text here/i);
    await user.type(textArea, 'A'.repeat(1000));
    
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);
    
    // Wait for proposals to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });
    
    // Click the bulk save button (our mocked version)
    const saveButton = screen.getByTestId('bulk-save-button');
    await user.click(saveButton);
    
    // Verify toast was called with the correct message
    expect(toast.success).toHaveBeenCalledWith('All flashcards have been saved successfully');
    
    // The above action should have triggered the onSaveComplete callback,
    // which should have cleared the proposals
    // We need to verify that state was updated correctly
    expect(screen.queryByText('Test Question 1')).not.toBeInTheDocument();
  });
}); 