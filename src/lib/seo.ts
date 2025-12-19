export function buildCanonical(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://hoffmann-niklas.de';
  try {
    const url = new URL(path, base);
    let href = url.href;
    // Remove trailing slash for non-root paths to keep canonical consistent
    if (url.pathname !== '/' && href.endsWith('/')) {
      href = href.slice(0, -1);
    }
    return href;
  } catch (err) {
    return base;
  }
}

export function buildLocalePath(locale: string, subpath = '') {
  const cleanSub = subpath ? `/${subpath.replace(/^\//, '')}` : '';
  return `/${locale}${cleanSub}`;
}
