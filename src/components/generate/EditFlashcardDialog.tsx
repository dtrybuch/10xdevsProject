import { useState } from "react";
import type { FlashcardProposalDTO } from "@/types";
import { Button } from "@/components/ui/button";

interface EditFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedProposal: FlashcardProposalDTO) => void;
  proposal: FlashcardProposalDTO;
}

export function EditFlashcardDialog({ isOpen, onClose, onSave, proposal }: EditFlashcardDialogProps) {
  const [front, setFront] = useState(proposal.front);
  const [back, setBack] = useState(proposal.back);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const validate = (): boolean => {
    const newErrors: { front?: string; back?: string } = {};

    if (front.length > 200) {
      newErrors.front = "Front text cannot exceed 200 characters";
    }
    if (back.length > 500) {
      newErrors.back = "Back text cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        ...proposal,
        front,
        back,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-[600px] space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Flashcard</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="front" className="block font-medium">
              Front <span className="text-sm text-gray-500">({front.length}/200)</span>
            </label>
            <textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className={`w-full min-h-[100px] p-2 border rounded-md ${
                errors.front ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.front && <p className="text-sm text-red-500">{errors.front}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="back" className="block font-medium">
              Back <span className="text-sm text-gray-500">({back.length}/500)</span>
            </label>
            <textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className={`w-full min-h-[100px] p-2 border rounded-md ${
                errors.back ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.back && <p className="text-sm text-red-500">{errors.back}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
