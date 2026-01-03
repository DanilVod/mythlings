import { useState, useEffect } from 'react';

interface UseMythlingIconResult {
  iconUrl: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for fetching mythling icons from the server.
 * Takes an icon path (e.g., '/uploads/1767403696107-wzcpep.png')
 * and returns the full URL, loading state, and error state.
 */
export function useMythlingIcon(
  iconPath: string | null | undefined,
): UseMythlingIconResult {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!iconPath) {
      setIconUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Construct full URL based on the icon path
    // If it's already a full URL (starts with http), use it as is
    // Otherwise, prepend the server URL from environment variables
    const fullUrl = iconPath.startsWith('http')
      ? iconPath
      : `${
          import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
        }${iconPath}`;

    // Fetch the image to verify it exists
    fetch(fullUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch icon: ${response.statusText}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setIconUrl(url);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching mythling icon:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to fetch icon'),
        );
        setIsLoading(false);
      });

    // Cleanup function to revoke the object URL
    return () => {
      if (iconUrl) {
        URL.revokeObjectURL(iconUrl);
      }
    };
  }, [iconPath]);

  return { iconUrl, isLoading, error };
}
