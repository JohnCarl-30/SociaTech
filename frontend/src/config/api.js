const DEFAULT_API_BASE_URL = "http://localhost/SociaTech/backend";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");
const trimLeadingSlash = (value) => value.replace(/^\/+/, "");

const joinUrl = (base, path = "") => {
  const normalizedBase = trimTrailingSlash(base);
  const normalizedPath = trimLeadingSlash(path);

  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
};

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

export const AUTH_API_URL = joinUrl(API_BASE_URL, "auth");

const LEGACY_BASE_URLS = [
  "http://localhost/SociaTech/backend",
  "http://localhost/Sociatech/backend",
  "https://sociatech-6.onrender.com",
  "http://localhost/SociaTech",
  "http://localhost/Sociatech",
].sort((left, right) => right.length - left.length);

export const rewriteLegacyUrl = (value) => {
  if (typeof value !== "string" || !value) {
    return value;
  }

  const matchedBase = LEGACY_BASE_URLS.find((base) => value.startsWith(base));

  if (!matchedBase) {
    return value;
  }

  return `${API_BASE_URL}${value.slice(matchedBase.length)}`;
};

export const resolveAuthUrl = (path) => joinUrl(AUTH_API_URL, path);

export const resolveAssetUrl = (path) => {
  if (!path) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return rewriteLegacyUrl(path);
  }

  return joinUrl(API_BASE_URL, path);
};

const normalizeResponseUrls = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeResponseUrls);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        normalizeResponseUrls(nestedValue),
      ])
    );
  }

  if (typeof value === "string") {
    return rewriteLegacyUrl(value);
  }

  return value;
};

const rewriteFetchInput = (input) => {
  if (typeof input === "string") {
    return rewriteLegacyUrl(input);
  }

  if (input instanceof URL) {
    return rewriteLegacyUrl(input.toString());
  }

  if (input instanceof Request) {
    const nextUrl = rewriteLegacyUrl(input.url);

    if (nextUrl === input.url) {
      return input;
    }

    return new Request(nextUrl, input);
  }

  return input;
};

let fetchInterceptorInstalled = false;

export const installApiFetchInterceptor = () => {
  if (
    fetchInterceptorInstalled ||
    typeof window === "undefined" ||
    typeof window.fetch !== "function"
  ) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const response = await originalFetch(rewriteFetchInput(input), init);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return response;
    }

    try {
      const rawBody = await response.clone().text();

      if (!rawBody) {
        return response;
      }

      const normalizedData = normalizeResponseUrls(JSON.parse(rawBody));
      const headers = new Headers(response.headers);

      headers.delete("content-length");

      return new Response(JSON.stringify(normalizedData), {
        headers,
        status: response.status,
        statusText: response.statusText,
      });
    } catch {
      return response;
    }
  };

  fetchInterceptorInstalled = true;
};
