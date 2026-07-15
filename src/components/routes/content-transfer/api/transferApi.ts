import axiosInstance from "@/config/axios-config";

export type TransferRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REVOKED"
  | "EXPIRED";

export type ContentTransferRequestDTO = {
  id: string;
  status: TransferRequestStatus;
  content_type: "plan" | "series";
  content_id: string;
  content_title?: string | null;
  source_group_id: string;
  target_group_id: string;
  source_group_title?: string | null;
  target_group_title?: string | null;
  created_at: string;
  expires_at: string;
};

export type TransferRequestListResponse = {
  requests: ContentTransferRequestDTO[];
};

function pickGroupId(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" && id.trim()) return id.trim();
  }
  return undefined;
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function idsEqual(a?: string | null, b?: string | null): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Walk common API envelope shapes to find the request array. */
export function extractTransferRequestArray(
  data: unknown,
  depth = 0,
): unknown[] {
  if (data == null || depth > 5) return [];
  if (Array.isArray(data)) return data;

  if (typeof data !== "object") return [];

  const root = data as Record<string, unknown>;
  const arrayKeys = [
    "transfers",
    "requests",
    "items",
    "transfer_requests",
    "incoming",
    "outgoing",
    "results",
    "data",
  ];

  for (const key of arrayKeys) {
    const nested = extractTransferRequestArray(root[key], depth + 1);
    if (nested.length > 0) return nested;
  }

  return [];
}

/** Normalizes list payloads when the API uses alternate keys or nested group objects. */
export function normalizeTransferRequest(
  raw: unknown,
): ContentTransferRequestDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const id =
    pickString(r.id) ??
    pickString(r.request_id) ??
    pickString(r.transfer_request_id);
  if (!id) return null;

  const typeRaw =
    pickString(r.entity_type) ??
    pickString(r.content_type) ??
    pickString(r.type);
  const contentType = typeRaw?.toLowerCase() === "series" ? "series" : "plan";

  const contentId =
    pickString(r.entity_id) ??
    pickString(r.content_id) ??
    (contentType === "series"
      ? pickString(r.series_id)
      : pickString(r.plan_id)) ??
    "";

  const targetGroup =
    r.to_group_id ??
    r.target_group_id ??
    r.target_group_uuid ??
    r.targetGroupId ??
    r.destination_group_id ??
    r.target_group;

  const sourceGroup =
    r.from_group_id ??
    r.source_group_id ??
    r.source_group_uuid ??
    r.sourceGroupId ??
    r.source_group;

  return {
    id,
    status:
      (pickString(r.status)?.toUpperCase() as TransferRequestStatus) ??
      "PENDING",
    content_type: contentType,
    content_id: contentId,
    content_title:
      pickString(r.entity_title) ??
      pickString(r.content_title) ??
      pickString(r.title) ??
      null,
    source_group_id: pickGroupId(sourceGroup) ?? "",
    target_group_id: pickGroupId(targetGroup) ?? "",
    source_group_title:
      pickString(r.from_group_title) ??
      pickString(r.source_group_title) ??
      pickString((sourceGroup as { title?: string } | undefined)?.title) ??
      null,
    target_group_title:
      pickString(r.to_group_title) ??
      pickString(r.target_group_title) ??
      pickString((targetGroup as { title?: string } | undefined)?.title) ??
      null,
    created_at: pickString(r.created_at) ?? new Date().toISOString(),
    expires_at:
      pickString(r.expires_at) ??
      pickString(r.expiresAt) ??
      new Date().toISOString(),
  };
}

export function normalizeTransferListResponse(
  data: unknown,
): TransferRequestListResponse {
  const list = extractTransferRequestArray(data);
  const requests = list
    .map(normalizeTransferRequest)
    .filter((r): r is ContentTransferRequestDTO => r != null);

  return { requests };
}

export function filterIncomingForGroup(
  requests: ContentTransferRequestDTO[],
  groupId: string,
): ContentTransferRequestDTO[] {
  const matched = requests.filter(
    (r) => !r.target_group_id || idsEqual(r.target_group_id, groupId),
  );
  return matched;
}

export function filterOutgoingForGroup(
  requests: ContentTransferRequestDTO[],
  groupId: string,
): ContentTransferRequestDTO[] {
  return requests.filter(
    (r) => !r.source_group_id || idsEqual(r.source_group_id, groupId),
  );
}

/** Prefer global list (what notifications use); optional group query params. */
async function fetchIncomingList(
  groupId?: string,
): Promise<TransferRequestListResponse> {
  const { data } = await axiosInstance.get(
    "/api/v1/cms/transfer-requests/incoming",
    {
      params: groupId
        ? { target_group_id: groupId, group_id: groupId }
        : undefined,
    },
  );
  const normalized = normalizeTransferListResponse(data);

  if (!groupId) return normalized;

  const matched = filterIncomingForGroup(normalized.requests, groupId);
  if (matched.length > 0) return { requests: matched };

  // Server returned rows but group ids were missing/mismatched in JSON — show all.
  if (normalized.requests.length > 0) return normalized;

  return { requests: [] };
}

async function fetchOutgoingList(
  groupId?: string,
): Promise<TransferRequestListResponse> {
  const { data } = await axiosInstance.get(
    "/api/v1/cms/transfer-requests/outgoing",
    {
      params: groupId
        ? { source_group_id: groupId, group_id: groupId }
        : undefined,
    },
  );
  const normalized = normalizeTransferListResponse(data);

  if (!groupId) return normalized;

  const matched = filterOutgoingForGroup(normalized.requests, groupId);
  if (matched.length > 0) return { requests: matched };

  if (normalized.requests.length > 0) return normalized;

  return { requests: [] };
}

export const fetchIncomingTransferRequests = async (
  groupId?: string,
): Promise<TransferRequestListResponse> => fetchIncomingList(groupId);

export const fetchOutgoingTransferRequests = async (
  groupId?: string,
): Promise<TransferRequestListResponse> => fetchOutgoingList(groupId);

export const createPlanTransferRequest = async (
  planId: string,
  targetGroupId: string,
): Promise<ContentTransferRequestDTO> => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/plans/${planId}/transfer-requests`,
    { target_group_id: targetGroupId },
  );
  return normalizeTransferRequest(data) ?? (data as ContentTransferRequestDTO);
};

export const createSeriesTransferRequest = async (
  seriesId: string,
  targetGroupId: string,
): Promise<ContentTransferRequestDTO> => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/series/${seriesId}/transfer-requests`,
    { target_group_id: targetGroupId },
  );
  return normalizeTransferRequest(data) ?? (data as ContentTransferRequestDTO);
};

export const acceptTransferRequest = async (requestId: string) => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/transfer-requests/${requestId}/accept`,
  );
  return data;
};

export const rejectTransferRequest = async (requestId: string) => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/transfer-requests/${requestId}/reject`,
  );
  return data;
};

export const revokeTransferRequest = async (requestId: string) => {
  const { data } = await axiosInstance.post(
    `/api/v1/cms/transfer-requests/${requestId}/revoke`,
  );
  return data;
};

export function isTransferRequestExpired(
  req: ContentTransferRequestDTO,
): boolean {
  if (req.status === "EXPIRED") return true;
  return new Date(req.expires_at).getTime() <= Date.now();
}
