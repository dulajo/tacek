import { useState, useEffect } from 'react';
import { EventDraft } from '../types/models';

const DRAFT_STORAGE_KEY = 'tacek_event_draft';

export function useEventDraft() {
  const [draft, setDraft] = useState<EventDraft | null>(null);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft, (key, value) => {
          if (key === 'savedAt' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        });
        setDraft(parsed);
      } catch (error) {
        console.error('Failed to load draft:', error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }
  }, []);

  const saveDraft = (draftData: EventDraft) => {
    const draftWithTimestamp = {
      ...draftData,
      savedAt: new Date(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftWithTimestamp));
    setDraft(draftWithTimestamp);
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraft(null);
  };

  const hasDraft = () => {
    return draft !== null;
  };

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
  };
}
