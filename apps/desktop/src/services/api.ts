const base = import.meta.env.VITE_LOCAL_API_BASE ?? 'http://127.0.0.1:4100';
export const api = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${base}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  return await res.json();
};
