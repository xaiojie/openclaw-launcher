const base = import.meta.env.VITE_LOCAL_API_BASE ?? 'http://127.0.0.1:4100';

export const api = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  const data = (await response.json().catch(() => null)) as T | null;
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: string }).message)
        : `请求失败: ${response.status}`;
    throw new Error(message);
  }

  return data as T;
};
