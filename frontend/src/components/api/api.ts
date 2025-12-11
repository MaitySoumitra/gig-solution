// src/api.ts
export const BASE_URL = '/'; // single base URL

export const fetcher = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include', // important for sending cookies
    ...options,
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch');
  }
  return res.json();
};
