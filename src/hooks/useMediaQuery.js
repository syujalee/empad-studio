import { useCallback, useSyncExternalStore } from 'react';

// Server snapshot is `false`, so prerendered markup always hydrates cleanly.
export function useMediaQuery(query) {
  const subscribe = useCallback((onChange) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
