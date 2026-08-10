export const AUTH0_INTENT_STORAGE_KEY = "auth0PhoneIntent";
export const PENDING_AUTH0_TOKEN_KEY = "pendingAuth0PhoneToken";
export const PENDING_AUTH0_PROVIDER_KEY = "pendingAuth0Provider";

export const AUTH0_INTENT = {
  phoneLogin: "phone_login",
  phoneLink: "phone_link",
  googleLogin: "google_login",
} as const;

export type Auth0PhoneIntent = (typeof AUTH0_INTENT)[keyof typeof AUTH0_INTENT];

export type Auth0PendingProvider = "phone" | "google";

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
  if (provider === "phone" || provider === "google") {
    return provider;
  }
  return null;
}

export function clearPendingAuth0Token() {
  sessionStorage.removeItem(PENDING_AUTH0_TOKEN_KEY);
  sessionStorage.removeItem(PENDING_AUTH0_PROVIDER_KEY);
}
