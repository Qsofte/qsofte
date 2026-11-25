import { useEffect } from 'react';
import { pages } from './content';

/** Keeps the document title in step during client-side navigation. The full
 *  metadata (description, canonical, Open Graph) is prerendered into each
 *  page's HTML at build time by scripts/prerender.mjs. */
export function usePageMeta(path: keyof typeof pages) {
  useEffect(() => {
    document.title = pages[path].title;
  }, [path]);
}
