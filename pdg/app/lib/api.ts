export function apiUrl(path: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");
  }

  const normalizedBase = backendUrl.endsWith("/")
    ? backendUrl.slice(0, -1)
    : backendUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}
