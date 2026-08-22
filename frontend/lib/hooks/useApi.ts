import { useQuery } from "@tanstack/react-query";

/**
 * A thin wrapper around `useQuery` that provides a consistent
 * error boundary and loading pattern for all API calls.
 *
 * Usage:
 *   const { data, isLoading, error } = useApi(["merchants"], () => api.getMerchants());
 */
export function useApi<TData>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery<TData>({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 60_000,
    enabled: options?.enabled,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
