import { QueryClient } from "@tanstack/react-query";

async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "An error occurred");
  }

  return response.json();
}

export { apiRequest };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const response = await fetch(url, { credentials: "include" });
        
        if (!response.ok) {
          throw new Error(await response.text());
        }
        
        return response.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});
