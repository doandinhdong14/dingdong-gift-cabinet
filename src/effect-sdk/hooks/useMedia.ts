import { useEffect, useRef } from 'react';

/**
 * Hook to manage media resources (images, audio) and track object URL cleanup
 * so memory is freed when components unmount or media changes.
 */
export function useMediaCleanup(mediaUrls: string[]) {
  const urlsRef = useRef<string[]>(mediaUrls);
  urlsRef.current = mediaUrls;

  useEffect(() => {
    return () => {
      // Clean up any blob URLs if allocated
      for (const url of urlsRef.current) {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(url);
          } catch {
            // ignore
          }
        }
      }
    };
  }, []);
}

export function resolveMediaUrl(url: string | undefined, fallback: string = ''): string {
  if (!url) return fallback;
  return url;
}
