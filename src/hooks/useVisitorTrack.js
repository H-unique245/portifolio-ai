import { useEffect } from 'react';
import { recordVisit } from '../lib/supabase';

export function useVisitorTrack() {
  useEffect(() => {
    // Fire and forget — doesn't block anything
    recordVisit();
  }, []);
}
