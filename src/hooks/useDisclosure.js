import { useCallback, useState } from 'react';

// Tracks which panel of a group is open; opening one closes the others (FAQ) and a group of one
// behaves as a plain toggle (add-ons).
export function useDisclosure() {
  const [openId, setOpenId] = useState(null);
  const toggle = useCallback((id) => setOpenId((current) => (current === id ? null : id)), []);
  const isOpen = useCallback((id) => openId === id, [openId]);
  return { isOpen, toggle };
}
