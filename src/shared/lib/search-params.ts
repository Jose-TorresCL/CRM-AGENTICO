export function firstSearchParams(
  params: Record<string, string | string[] | undefined>,
) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

export function asSearchParams(params: URLSearchParams) {
  return Object.fromEntries(params.entries());
}
