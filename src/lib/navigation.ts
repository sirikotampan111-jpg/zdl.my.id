/**
 * Navigation utility for SEO-friendly URL routing.
 * Maps Zustand page names to real Next.js routes.
 *
 * Components should use `navigateTo(page)` instead of just `setCurrentPage(page)`
 * to ensure the browser URL updates, which allows Google to discover and index each page.
 */

export const PAGE_ROUTES: Record<string, string> = {
  home: "/",
  portofolio: "/portofolio",
  layanan: "/layanan",
  kontak: "/kontak",
  keranjang: "/",
};

/**
 * Get the real URL path for a Zustand page name.
 */
export function getPageRoute(page: string): string {
  return PAGE_ROUTES[page] || "/";
}

/**
 * Navigate to a page using real URL routing.
 * Updates both the Zustand store AND the browser URL.
 */
export function navigateTo(
  page: string,
  setCurrentPage: (page: string) => void,
  router: { push: (url: string) => void }
) {
  setCurrentPage(page);
  const targetPath = getPageRoute(page);
  router.push(targetPath);
}
