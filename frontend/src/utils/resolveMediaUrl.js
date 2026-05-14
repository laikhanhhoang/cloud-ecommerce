export function resolveMediaUrl(value) {
  if (!value) return null;
  if (typeof value !== 'string') return null;

  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl && value.startsWith('/')) return `${backendUrl}${value}`;

  return value;
}
