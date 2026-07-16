import { useEffect, useState, useCallback } from "react";
import { loadState, saveState, defaultState } from "./storage";
import type { AppState } from "./types";

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    const handler = () => setState(loadState());
    window.addEventListener("ember:state-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("ember:state-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    let computed: AppState | null = null;
    setState((prev) => {
      const next = updater(prev);
      computed = next;
      saveState(next);
      return next;
    });
    // Belt-and-braces: in StrictMode the updater can be invoked twice; ensure
    // the latest value is persisted synchronously for any code that reads
    // localStorage right after update() (e.g. route guards).
    if (computed) saveState(computed);
  }, []);

  const reset = useCallback(() => {
    const fresh = defaultState();
    saveState(fresh);
    setState(fresh);
  }, []);

  return { state, update, reset };
}
