import axiosInstance from "@/config/axios-config";

export interface EventLocation {
  id: string;
  group_id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationDetail extends EventLocation {
  event_count: number;
}

export interface LocationsResponse {
  locations: LocationDetail[];
  skip: number;
  limit: number;
  total: number;
}

export interface CreateLocationRequest {
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationRequest {
  name?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LocationListParams {
  search?: string;
  skip?: number;
  limit?: number;
}

const BASE_URL = "/api/v1/cms/author/groups";

export const MAX_LOCATION_LIMIT = 100;

const locationsUrl = (groupId: string) => `${BASE_URL}/${groupId}/locations`;

export const fetchLocations = async (
  groupId: string,
  params: LocationListParams = {},
): Promise<LocationsResponse> => {
  const { data } = await axiosInstance.get<LocationsResponse>(
    locationsUrl(groupId),
    {
      params: {
        ...(params.search ? { search: params.search } : {}),
        skip: params.skip ?? 0,
        limit: Math.min(params.limit ?? 20, MAX_LOCATION_LIMIT),
      },
    },
  );
  return data;
};

export const fetchLocation = async (
  groupId: string,
  locationId: string,
): Promise<LocationDetail> => {
  const { data } = await axiosInstance.get<LocationDetail>(
    `${locationsUrl(groupId)}/${locationId}`,
  );
  return data;
};

export const createLocation = async (
  groupId: string,
  body: CreateLocationRequest,
): Promise<LocationDetail> => {
  const { data } = await axiosInstance.post<LocationDetail>(
    locationsUrl(groupId),
    body,
  );
  return data;
};

export const updateLocation = async (
  groupId: string,
  locationId: string,
  body: UpdateLocationRequest,
): Promise<LocationDetail> => {
  const { data } = await axiosInstance.patch<LocationDetail>(
    `${locationsUrl(groupId)}/${locationId}`,
    body,
  );
  return data;
};

export const deleteLocation = async (
  groupId: string,
  locationId: string,
): Promise<void> => {
  await axiosInstance.delete(`${locationsUrl(groupId)}/${locationId}`);
};

export function hasCoordinates(
  location: Pick<EventLocation, "latitude" | "longitude">,
): location is { latitude: number; longitude: number } {
  return location.latitude != null && location.longitude != null;
}

export function formatCoordinates(
  location: Pick<EventLocation, "latitude" | "longitude">,
  digits = 5,
): string | null {
  if (!hasCoordinates(location)) return null;
  return `${location.latitude.toFixed(digits)}, ${location.longitude.toFixed(digits)}`;
}

export function buildUpdateLocationBody(
  next: { name: string; latitude: number | null; longitude: number | null },
  original: Pick<EventLocation, "name" | "latitude" | "longitude">,
): UpdateLocationRequest {
  const body: UpdateLocationRequest = {};

  const nextName = next.name.trim();
  if (nextName !== original.name.trim()) body.name = nextName;

  const prevLat = original.latitude ?? null;
  const prevLng = original.longitude ?? null;

  if (next.latitude !== prevLat || next.longitude !== prevLng) {
    body.latitude = next.latitude;
    body.longitude = next.longitude;
  }

  return body;
}

export interface LocationInUseError {
  error: "LOCATION_IN_USE";
  message: string;
  event_count: number;
}

export function getLocationInUseError(
  error: unknown,
): LocationInUseError | null {
  const detail = (
    error as { response?: { data?: { detail?: Partial<LocationInUseError> } } }
  )?.response?.data?.detail;
  if (detail?.error !== "LOCATION_IN_USE") return null;
  return {
    error: "LOCATION_IN_USE",
    message: detail.message ?? "This location is in use.",
    event_count: detail.event_count ?? 0,
  };
}

export const makeLocationSearchFn =
  (groupId: string) => async (params: LocationListParams) => {
    const data = await fetchLocations(groupId, params);
    return {
      items: data.locations,
      skip: data.skip,
      limit: data.limit,
      total: data.total,
    };
  };
