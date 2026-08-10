const AUTOCOMPLETE_URL = "https://api.locationiq.com/v1/autocomplete";
const REVERSE_URL = "https://api.locationiq.com/v1/reverse";

export const PLACE_SEARCH_MIN_LENGTH = 4;
export const PLACE_SEARCH_DEBOUNCE_MS = 600;

const CACHE_LIMIT = 50;
const cache = new Map<string, PlaceResult[]>();

function readCache(key: string): PlaceResult[] | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

function writeCache(key: string, results: PlaceResult[]) {
  cache.set(key, results);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

export interface PlaceResult {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  latitude: number;
  longitude: number;
}

interface LocationIqPlace {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  display_place?: string;
  display_address?: string;
}

export function getPlaceSearchToken(): string {
  return import.meta.env.VITE_LOCATIONIQ_TOKEN || "";
}

export function isPlaceSearchEnabled(): boolean {
  return Boolean(getPlaceSearchToken());
}

function toPlaceResult(place: LocationIqPlace): PlaceResult | null {
  const latitude = Number(place.lat);
  const longitude = Number(place.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const [head, ...rest] = place.display_name.split(",");
  const primary = place.display_place?.trim() || head?.trim() || "";
  const secondary =
    place.display_address?.trim() || rest.join(",").trim() || "";

  if (!primary) return null;

  return {
    id: place.place_id,
    label: place.display_name,
    primary,
    secondary,
    latitude,
    longitude,
  };
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < PLACE_SEARCH_MIN_LENGTH) return [];

  const token = getPlaceSearchToken();
  if (!token) return [];

  const cacheKey = trimmed.toLowerCase();
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    key: token,
    q: trimmed,
    limit: "8",
    dedupe: "1",
  });

  const response = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) {
    writeCache(cacheKey, []);
    return [];
  }

  if (!response.ok) {
    throw new Error(`Place search failed (${response.status})`);
  }

  const places: LocationIqPlace[] = await response.json();
  if (!Array.isArray(places)) return [];

  const results = places
    .map(toPlaceResult)
    .filter((place): place is PlaceResult => place != null);

  writeCache(cacheKey, results);
  return results;
}

const reverseCache = new Map<string, string | null>();

function reverseKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const token = getPlaceSearchToken();
  if (!token) return null;

  const key = reverseKey(latitude, longitude);
  if (reverseCache.has(key)) return reverseCache.get(key) ?? null;

  const params = new URLSearchParams({
    key: token,
    lat: String(latitude),
    lon: String(longitude),
    format: "json",
    zoom: "18",
  });

  const response = await fetch(`${REVERSE_URL}?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) {
    reverseCache.set(key, null);
    return null;
  }

  if (!response.ok) {
    throw new Error(`Reverse lookup failed (${response.status})`);
  }

  const place: LocationIqPlace = await response.json();
  const parsed = place?.display_name ? toPlaceResult(place) : null;
  const name = parsed?.primary ?? null;

  if (reverseCache.size > CACHE_LIMIT) {
    const oldest = reverseCache.keys().next().value;
    if (oldest !== undefined) reverseCache.delete(oldest);
  }
  reverseCache.set(key, name);

  return name;
}
