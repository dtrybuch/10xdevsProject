/**
 * Custom hook for client-side navigation that works with Astro's View Transitions API
 */
export function useNavigate() {
  return (path: string) => {
    // Check if the ViewTransitions API is available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.href = path;
      });
    } else {
      window.location.href = path;
    }
  };
}
