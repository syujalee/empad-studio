// One passive scroll listener for the whole page; subscribers run at most once per animation frame.
const subscribers = new Set();
let frame = 0;

function handleScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    subscribers.forEach((callback) => callback());
  });
}

export function subscribeToScroll(callback) {
  if (subscribers.size === 0) window.addEventListener('scroll', handleScroll, { passive: true });
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
    if (subscribers.size > 0) return;
    window.removeEventListener('scroll', handleScroll);
    cancelAnimationFrame(frame);
    frame = 0;
  };
}
