function appendParam(searchParams: URLSearchParams, key: string, value: any) {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    for (const v of value) appendParam(searchParams, key, v);
  } else if (typeof value === "object") {
    // Flatten nested objects as key[sub]=val
    for (const [k, v] of Object.entries(value)) appendParam(searchParams, `${key}[${k}]`, v);
  } else {
    searchParams.append(key, String(value));
  }
}

export function toQuery(params?: Record<string, any>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) appendParam(sp, k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function getQuery(url: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  // Extract the raw query string (without '#...')
  const qIndex = url.indexOf("?");
  if (qIndex === -1) return out;
  const hashIndex = url.indexOf("#", qIndex + 1);
  const raw = url.slice(qIndex + 1, hashIndex === -1 ? undefined : hashIndex);
  const sp = new URLSearchParams(raw);
  for (const key of sp.keys()) {
    const values = sp.getAll(key);
    out[key] = values.length > 1 ? values : (values[0] ?? "");
  }
  return out;
}

export function addQuery(url: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) return url;
  // Split to preserve hash
  const hashIndex = url.indexOf("#");
  const baseWithQuery = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);

  const [base, existingQuery] = (() => {
    const qIndex = baseWithQuery.indexOf("?");
    if (qIndex === -1) return [baseWithQuery, ""] as const;
    return [baseWithQuery.slice(0, qIndex), baseWithQuery.slice(qIndex + 1)] as const;
  })();

  const sp = new URLSearchParams(existingQuery);
  // For each provided key, delete existing entries then append flattened values
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    sp.delete(k);
    appendParam(sp, k, v);
  }

  const qs = sp.toString();
  return `${base}${qs ? `?${qs}` : ""}${hash}`;
}
