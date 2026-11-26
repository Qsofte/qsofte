import { useCallback, useEffect, useState } from 'react';

/** Loads data for a page; `reload` fetches again after a save. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  const reload = useCallback(() => {
    setError(null);
    return run()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [run]);

  useEffect(() => {
    let live = true;
    setError(null);
    run()
      .then((d) => live && setData(d))
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      live = false;
    };
  }, [run]);

  return { data, error, reload, setData };
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Payments Desk`;
  }, [title]);
}
