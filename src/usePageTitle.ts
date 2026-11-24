import { useEffect } from 'react';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | Qsofte` : 'Qsofte | Software & Technology Partner';
  }, [title]);
}
