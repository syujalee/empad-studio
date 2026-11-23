import { useCallback, useSyncExternalStore } from 'react';
import { subscribeToScroll } from '../lib/scroll-frame.js';

// Server snapshot is always "not scrolled" so the prerendered markup hydrates without mismatch.
export function useScrolled(threshold) {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  return useSyncExternalStore(subscribeToScroll, getSnapshot, () => false);
}
