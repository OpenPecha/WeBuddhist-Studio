export const AUTH0_INTENT_STORAGE_KEY = "auth0PhoneIntent";
export const PENDING_AUTH0_TOKEN_KEY = "pendingAuth0PhoneToken";
export const PENDING_AUTH0_PROVIDER_KEY = "pendingAuth0Provider";

export const AUTH0_INTENT = {
  phoneLogin: "phone_login",
  phoneLink: "phone_link",
  googleLogin: "google_login",
} as const;

export type Auth0PhoneIntent = (typeof AUTH0_INTENT)[keyof typeof AUTH0_INTENT];

export type Auth0PendingProvider = "phone" | "google" | "email";

/**
 * Determines which backend exchange a raw Auth0 access token belongs to by
 * inspecting its subject claim. Users can switch identifier (e.g. pick email
 * instead of phone) on the Auth0 universal login page, so the login intent we
 * stored before the redirect is not a reliable signal of the connection used.
 */
export function getAuth0ProviderFromToken(
  token: string,
): Auth0PendingProvider | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { sub?: unknown };
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    if (sub.startsWith("sms|")) return "phone";
    if (sub.startsWith("google-oauth2|")) return "google";
    if (sub.startsWith("auth0|") || sub.startsWith("email|")) return "email";
    return null;
  } catch {
    return null;
  }
}

export function getAuth0Config() {
  const domain = (import.meta.env.VITE_AUTH0_DOMAIN || "").trim();
  const clientId = (import.meta.env.VITE_AUTH0_CLIENT_ID || "").trim();
  const audience = (import.meta.env.VITE_AUTH0_AUDIENCE || "").trim();
  const connection =
    (import.meta.env.VITE_AUTH0_SMS_CONNECTION || "sms").trim() || "sms";
  const googleConnection =
    (import.meta.env.VITE_AUTH0_GOOGLE_CONNECTION || "google-oauth2").trim() ||
    "google-oauth2";

  return {
    domain,
    clientId,
    audience,
    connection,
    googleConnection,
    isConfigured: Boolean(domain && clientId),
  };
}

export function setAuth0Intent(intent: Auth0PhoneIntent) {
  sessionStorage.setItem(AUTH0_INTENT_STORAGE_KEY, intent);
}

export function consumeAuth0Intent(): Auth0PhoneIntent | null {
  const intent = sessionStorage.getItem(AUTH0_INTENT_STORAGE_KEY);
  sessionStorage.removeItem(AUTH0_INTENT_STORAGE_KEY);
  if (
    intent === AUTH0_INTENT.phoneLogin ||
    intent === AUTH0_INTENT.phoneLink ||
    intent === AUTH0_INTENT.googleLogin
  ) {
    return intent;
  }
  return null;
}

export function peekAuth0Intent(): Auth0PhoneIntent | null {
  const intent = sessionStorage.getItem(AUTH0_INTENT_STORAGE_KEY);
  if (
    intent === AUTH0_INTENT.phoneLogin ||
    intent === AUTH0_INTENT.phoneLink ||
    intent === AUTH0_INTENT.googleLogin
  ) {
    return intent;
  }
  return null;
}

export function setPendingAuth0Token(
  token: string,
  provider: Auth0PendingProvider = "phone",
) {
  sessionStorage.setItem(PENDING_AUTH0_TOKEN_KEY, token);
  sessionStorage.setItem(PENDING_AUTH0_PROVIDER_KEY, provider);
}

export function getPendingAuth0Token(): string | null {
  return sessionStorage.getItem(PENDING_AUTH0_TOKEN_KEY);
}

export function getPendingAuth0Provider(): Auth0PendingProvider | null {
  const provider = sessionStorage.getItem(PENDING_AUTH0_PROVIDER_KEY);
  if (provider === "phone" || provider === "google" || provider === "email") {
    return provider;
  }
  return null;
}

export function clearPendingAuth0Token() {
  sessionStorage.removeItem(PENDING_AUTH0_TOKEN_KEY);
  sessionStorage.removeItem(PENDING_AUTH0_PROVIDER_KEY);
}
