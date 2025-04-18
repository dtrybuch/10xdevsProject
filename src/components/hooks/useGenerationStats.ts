import { useState, useEffect } from 'react';
import type { FlashcardProposalDTO } from '@/types';

interface GenerationStats {
  acceptedCount: number;
  editedCount: number;
  rejectedCount: number;
  sessionDuration: string; // ISO 8601 duration
}

export function useGenerationStats(proposals: FlashcardProposalDTO[]) {
  const [stats, setStats] = useState<GenerationStats>({
    acceptedCount: 0,
    editedCount: 0,
    rejectedCount: 0,
    sessionDuration: 'PT0S'
  });

  const [startTime] = useState(() => new Date());

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const duration = new Date().getTime() - startTime.getTime();
      const hours = Math.floor(duration / 3600000);
      const minutes = Math.floor((duration % 3600000) / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      
      setStats(prev => ({
        ...prev,
        sessionDuration: `PT${hours}H${minutes}M${seconds}S`
      }));
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [startTime]);

  const incrementAccepted = () => {
    setStats(prev => ({ ...prev, acceptedCount: prev.acceptedCount + 1 }));
  };

  const incrementEdited = () => {
    setStats(prev => ({ ...prev, editedCount: prev.editedCount + 1 }));
  };

  const incrementRejected = () => {
    setStats(prev => ({ ...prev, rejectedCount: prev.rejectedCount + 1 }));
  };

  return {
    stats,
    incrementAccepted,
    incrementEdited,
    incrementRejected
  };
} 