import { StrictMode, startTransition } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles/index.css';

const rootElement = document.getElementById('root');
const app = <StrictMode><App /></StrictMode>;

// Production HTML is prerendered (scripts/prerender.js); the dev server serves an empty root.
// Hydrating inside a transition lets React yield between chunks instead of one long task.
if (rootElement.firstElementChild) startTransition(() => hydrateRoot(rootElement, app));
else createRoot(rootElement).render(app);
