"use client";

import { useEffect, useState } from "react";

export function useDebouncedSearch(search: string, delayMs: number) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  if (search.length === 0 && debouncedSearch.length > 0) {
    setDebouncedSearch("");
  }

  useEffect(() => {
    if (search.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, search]);

  return search.length === 0 ? "" : debouncedSearch;
}
