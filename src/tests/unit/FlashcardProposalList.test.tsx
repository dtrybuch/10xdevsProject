import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FlashcardProposalList } from "../../components/FlashcardProposalList";
import type { FlashcardProposalDTO } from "@/types";
import "@testing-library/jest-dom/vitest";

describe("FlashcardProposalList", () => {
  const user = userEvent.setup();

  const mockProposals: FlashcardProposalDTO[] = [
    { front: "Question 1", back: "Answer 1", type: "ai" as const },
    { front: "Question 2", back: "Answer 2", type: "ai" as const },
  ];

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders correctly with proposals", () => {
    const mockOnProposalsChange = vi.fn();
    const mockOnStatsChange = vi.fn();

    render(
      <FlashcardProposalList
        proposals={mockProposals}
        onProposalsChange={mockOnProposalsChange}
        onStatsChange={mockOnStatsChange}
      />
    );

    // Check if both flashcards are displayed
    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Answer 1")).toBeInTheDocument();
    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("Answer 2")).toBeInTheDocument();

    // Check if action buttons are present for each flashcard
    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });

    expect(acceptButtons).toHaveLength(2);
    expect(editButtons).toHaveLength(2);
    expect(rejectButtons).toHaveLength(2);
  });

  it("does not render when no proposals are provided", () => {
    const mockOnProposalsChange = vi.fn();
    const mockOnStatsChange = vi.fn();

    const { container } = render(
      <FlashcardProposalList
        proposals={[]}
        onProposalsChange={mockOnProposalsChange}
        onStatsChange={mockOnStatsChange}
      />
    );

    // The component should return null, so container should be empty
    expect(container).toBeEmptyDOMElement();
  });

  it("handles accepting a flashcard proposal", async () => {
    const mockOnProposalsChange = vi.fn();
    const mockOnStatsChange = vi.fn();

    render(
      <FlashcardProposalList
        proposals={mockProposals}
        onProposalsChange={mockOnProposalsChange}
        onStatsChange={mockOnStatsChange}
      />
    );

    // Find and click the first "Accept" button
    const acceptButtons = screen.getAllByRole("button", { name: /accept/i });
    await user.click(acceptButtons[0]);

    // Check if onProposalsChange was called with the updated proposals
    expect(mockOnProposalsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          front: "Question 1",
          back: "Answer 1",
          status: "accepted",
        }),
      ])
    );

    // Check if onStatsChange was called
    expect(mockOnStatsChange).toHaveBeenCalled();
  });

  it("handles rejecting a flashcard proposal", async () => {
    const mockOnProposalsChange = vi.fn();
    const mockOnStatsChange = vi.fn();

    render(
      <FlashcardProposalList
        proposals={mockProposals}
        onProposalsChange={mockOnProposalsChange}
        onStatsChange={mockOnStatsChange}
      />
    );

    // Find and click the first "Reject" button
    const rejectButtons = screen.getAllByRole("button", { name: /reject/i });
    await user.click(rejectButtons[0]);

    // Verify that onProposalsChange was called and the proposals were updated correctly
    // We don't assert the exact number of calls since that's implementation-dependent
    expect(mockOnProposalsChange).toHaveBeenCalled();

    // Get the last call arguments
    const calls = mockOnProposalsChange.mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    const lastCallArguments = calls[calls.length - 1][0];
    expect(lastCallArguments).toHaveLength(1);
    expect(lastCallArguments[0].front).toBe("Question 2");

    // Check if onStatsChange was called
    expect(mockOnStatsChange).toHaveBeenCalled();
  });

  it("opens edit dialog when edit button is clicked", async () => {
    const mockOnProposalsChange = vi.fn();
    const mockOnStatsChange = vi.fn();

    render(
      <FlashcardProposalList
        proposals={mockProposals}
        onProposalsChange={mockOnProposalsChange}
        onStatsChange={mockOnStatsChange}
      />
    );

    // Find and click the first "Edit" button
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    // Check if edit dialog is opened (look for dialog title or content)
    expect(screen.getByText(/Edit Flashcard/i)).toBeInTheDocument();

    // The dialog should contain the flashcard content
    expect(screen.getByDisplayValue("Question 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Answer 1")).toBeInTheDocument();
  });
});
