import { QueryClient } from "@tanstack/react-query";

async function apiRequest(url: string, options?: RequestInit) {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers as Record<string, string>,
  };
  
  // Add token to Authorization header if it exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
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
        const token = localStorage.getItem("auth_token");
        const headers: Record<string, string> = {};
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, { 
          credentials: "include",
          headers 
        });
        
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
