export function getApiErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: unknown } })?.response?.data;

  if (typeof response === 'string') return response;

  const data = response as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ');
  }

  return data?.message || fallback;
}
