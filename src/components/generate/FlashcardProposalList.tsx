import { useState } from "react";
import type { FlashcardProposalDTO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Edit2 } from "lucide-react";
import { EditFlashcardDialog } from "./EditFlashcardDialog";

interface FlashcardProposalListProps {
  proposals: FlashcardProposalDTO[];
  onAccept: (proposal: FlashcardProposalDTO) => void;
  onEdit: (proposal: FlashcardProposalDTO) => void;
  onReject: (proposal: FlashcardProposalDTO) => void;
}

export function FlashcardProposalList({
  proposals,
  onAccept,
  onEdit,
  onReject,
}: FlashcardProposalListProps) {
  const [editingProposal, setEditingProposal] = useState<FlashcardProposalDTO | null>(null);

  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Generated Flashcards</h2>
      <div className="space-y-4">
        {proposals.map((proposal, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Flashcard {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-500">Front</h3>
                  <p className="p-3 bg-gray-50 rounded-md">{proposal.front}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-gray-500">Back</h3>
                  <p className="p-3 bg-gray-50 rounded-md">{proposal.back}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(proposal)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProposal(proposal)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onAccept(proposal)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingProposal && (
        <EditFlashcardDialog
          isOpen={true}
          onClose={() => setEditingProposal(null)}
          onSave={(editedProposal) => {
            onEdit(editedProposal);
            setEditingProposal(null);
          }}
          proposal={editingProposal}
        />
      )}
    </div>
  );
} 