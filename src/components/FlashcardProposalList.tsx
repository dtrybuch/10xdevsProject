import { useState } from "react";
import { FlashcardProposalListItem } from "./FlashcardProposalListItem";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import { useGenerationStats } from "./hooks/useGenerationStats";
import type { FlashcardProposalDTO } from "@/types";
import React from "react";

interface FlashcardProposalListProps {
  proposals: FlashcardProposalDTO[];
  onProposalsChange?: (proposals: FlashcardProposalDTO[]) => void;
  onStatsChange?: (stats: {
    acceptedCount: number;
    editedCount: number;
    rejectedCount: number;
    sessionDuration: string;
  }) => void;
}

export function FlashcardProposalList({ 
  proposals,
  onProposalsChange,
  onStatsChange
}: FlashcardProposalListProps) {
  const [editingProposal, setEditingProposal] = useState<FlashcardProposalDTO | null>(null);
  const [localProposals, setLocalProposals] = useState<FlashcardProposalDTO[]>(proposals);
  
  const { 
    stats, 
    incrementAccepted, 
    incrementEdited, 
    incrementRejected 
  } = useGenerationStats(proposals);

  // Synchronize localProposals with proposals prop
  React.useEffect(() => {
    setLocalProposals(proposals);
  }, [proposals]);

  // Update parent component whenever stats change
  React.useEffect(() => {
    onStatsChange?.(stats);
  }, [stats, onStatsChange]);

  const updateProposals = (newProposals: FlashcardProposalDTO[]) => {
    setLocalProposals(newProposals);
    onProposalsChange?.(newProposals);
  };

  const handleAccept = (proposal: FlashcardProposalDTO) => {
    const newProposals = localProposals.map(p => 
      p === proposal ? { ...p, status: 'accepted' as const } : p
    );
    updateProposals(newProposals);
    incrementAccepted();
  };

  const handleReject = (proposal: FlashcardProposalDTO) => {
    const newProposals = localProposals.filter(p => p !== proposal);
    updateProposals(newProposals);
    incrementRejected();
  };

  const handleEdit = (proposal: FlashcardProposalDTO) => {
    setEditingProposal(proposal);
  };

  const handleSaveEdit = (editedProposal: FlashcardProposalDTO) => {
    const newProposals = localProposals.map(p => 
      p === editingProposal ? { ...editedProposal, status: 'edited' as const } : p
    );
    updateProposals(newProposals);
    incrementEdited();
    setEditingProposal(null);
  };

  if (localProposals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {localProposals.map((proposal, index) => (
        <FlashcardProposalListItem
          key={index}
          index={index}
          proposal={proposal}
          onAccept={handleAccept}
          onReject={handleReject}
          onEdit={handleEdit}
        />
      ))}
      
      {editingProposal && (
        <EditFlashcardDialog
          isOpen={true}
          onClose={() => setEditingProposal(null)}
          onSave={handleSaveEdit}
          proposal={editingProposal}
        />
      )}
    </div>
  );
} 