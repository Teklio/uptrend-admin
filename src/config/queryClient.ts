import { QueryClient } from "@tanstack/react-query";

// Shared singleton — imported both by main.tsx (for the Provider) and by
// modules outside the React tree (like videoUploadManager) that need to
// invalidate query caches after a background task finishes.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
