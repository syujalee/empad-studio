import { useEffect, useRef } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import { useEscapeKey } from '../hooks/useEscapeKey.js';

const SWIPE_THRESHOLD_PX = 50;
const controlClass = 'absolute z-10 flex min-h-12 min-w-12 items-center justify-center text-white transition-all hover:text-gold';

// Fullscreen portfolio viewer: modal dialog with focus trap, keyboard arrows and touch swipe.
export function Lightbox({ images, index, returnFocusTo, onClose, onNavigate }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const touchStartX = useRef(null);
  const image = images[index];

  useBodyScrollLock(true);
  useEscapeKey(onClose);

  useEffect(() => {
    closeRef.current.focus();
    return () => returnFocusTo?.focus({ preventScroll: true });
  }, [returnFocusTo]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') onNavigate(-1);
      if (event.key === 'ArrowRight') onNavigate(1);
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('button')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) onNavigate(deltaX < 0 ? 1 : -1);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Foto portfolio ${index + 1} dari ${images.length}`}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(0,0,0,0.95)]"
      onClick={(event) => event.target === event.currentTarget && onClose()}
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
    >
      <button ref={closeRef} type="button" className={`${controlClass} top-5 right-6 text-[2.5rem]`} aria-label="Close" onClick={onClose}>
        &times;
      </button>
      <button type="button" className={`${controlClass} top-1/2 left-5 [transform:translateY(-50%)] text-[3rem]`} aria-label="Previous" onClick={() => onNavigate(-1)}>
        &#8249;
      </button>
      <button type="button" className={`${controlClass} top-1/2 right-5 [transform:translateY(-50%)] text-[3rem]`} aria-label="Next" onClick={() => onNavigate(1)}>
        &#8250;
      </button>
      <div className="max-h-[90vh] max-w-[90vw]">
        <img src={image.src} alt={image.alt} className="max-h-[85vh] max-w-[90vw] rounded-[8px] object-contain" />
      </div>
    </div>
  );
}
