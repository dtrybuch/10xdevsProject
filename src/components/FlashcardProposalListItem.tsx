import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";
import type { FlashcardProposalDTO } from "@/types";

interface FlashcardProposalListItemProps {
  proposal: FlashcardProposalDTO;
  onAccept: (proposal: FlashcardProposalDTO) => void;
  onReject: (proposal: FlashcardProposalDTO) => void;
  onEdit: (proposal: FlashcardProposalDTO) => void;
  index: number;
}

export function FlashcardProposalListItem({
  proposal,
  onAccept,
  onReject,
  onEdit,
  index,
}: FlashcardProposalListItemProps) {
  return (
    <Card className="overflow-hidden" data-test-id={`flashcard-proposal-${index}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Front</CardTitle>
        <p className="mt-2 whitespace-pre-wrap" data-test-id="flashcard-front">{proposal.front}</p>
      </CardHeader>
      <CardContent className="pb-4">
        <CardTitle className="text-lg font-semibold mb-2">Back</CardTitle>
        <p className="whitespace-pre-wrap" data-test-id="flashcard-back">{proposal.back}</p>
      </CardContent>
      <CardFooter className="flex justify-between gap-4 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onAccept(proposal)}
          disabled={proposal.status === 'accepted'}
          data-test-id="accept-flashcard-button"
        >
          <Check className="w-4 h-4 mr-2" />
          {proposal.status === 'accepted' ? 'Accepted' : 'Accept'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(proposal)}
          disabled={proposal.status === 'accepted'}
          data-test-id="edit-flashcard-button"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onReject(proposal)}
          disabled={proposal.status === 'accepted'}
          data-test-id="reject-flashcard-button"
        >
          <X className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
} 