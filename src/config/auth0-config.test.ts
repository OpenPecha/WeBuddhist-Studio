import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  AUTH0_INTENT,
  clearPendingAuth0Token,
  consumeAuth0Intent,
  getAuth0Config,
  getPendingAuth0Token,
  setAuth0Intent,
  setPendingAuth0Token,
} from "@/config/auth0-config";

describe("auth0-config helpers", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.unstubAllEnvs();
  });

  it("stores and consumes phone intents", () => {
    setAuth0Intent(AUTH0_INTENT.phoneLogin);
    expect(consumeAuth0Intent()).toBe(AUTH0_INTENT.phoneLogin);
    expect(consumeAuth0Intent()).toBeNull();
  });

  it("stores pending Auth0 tokens for profile completion", () => {
    setPendingAuth0Token("token-abc");
    expect(getPendingAuth0Token()).toBe("token-abc");
    clearPendingAuth0Token();
    expect(getPendingAuth0Token()).toBeNull();
  });

  it("reports Auth0 as configured when domain and client id exist", () => {
    vi.stubEnv("VITE_AUTH0_DOMAIN", "example.auth0.com");
    vi.stubEnv("VITE_AUTH0_CLIENT_ID", "spa-client");
    vi.stubEnv("VITE_AUTH0_AUDIENCE", "webuddhist-backend");
    vi.stubEnv("VITE_AUTH0_SMS_CONNECTION", "sms");

    expect(getAuth0Config()).toEqual({
      domain: "example.auth0.com",
      clientId: "spa-client",
      audience: "webuddhist-backend",
      connection: "sms",
      googleConnection: "google-oauth2",
      isConfigured: true,
    });
  });
});
