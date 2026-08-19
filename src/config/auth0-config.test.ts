import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  AUTH0_INTENT,
  clearPendingAuth0Token,
  consumeAuth0Intent,
  getAuth0Config,
  getAuth0ProviderFromToken,
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

describe("getAuth0ProviderFromToken", () => {
  const makeJwt = (payload: object) =>
    ["header", btoa(JSON.stringify(payload)), "signature"].join(".");

  it("classifies sms subjects as phone", () => {
    expect(getAuth0ProviderFromToken(makeJwt({ sub: "sms|681f2" }))).toBe(
      "phone",
    );
  });

  it("classifies google-oauth2 subjects as google", () => {
    expect(
      getAuth0ProviderFromToken(makeJwt({ sub: "google-oauth2|10859" })),
    ).toBe("google");
  });

  it("classifies auth0 and email subjects as email", () => {
    expect(getAuth0ProviderFromToken(makeJwt({ sub: "auth0|64ac1" }))).toBe(
      "email",
    );
    expect(getAuth0ProviderFromToken(makeJwt({ sub: "email|64ac1" }))).toBe(
      "email",
    );
  });

  it("decodes base64url payloads without padding", () => {
    const payload = btoa(JSON.stringify({ sub: "sms|1234567" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(getAuth0ProviderFromToken(`header.${payload}.signature`)).toBe(
      "phone",
    );
  });

  it("returns null for unknown subjects", () => {
    expect(
      getAuth0ProviderFromToken(makeJwt({ sub: "windowslive|abc" })),
    ).toBeNull();
  });

  it("returns null when the subject claim is missing or not a string", () => {
    expect(getAuth0ProviderFromToken(makeJwt({}))).toBeNull();
    expect(getAuth0ProviderFromToken(makeJwt({ sub: 42 }))).toBeNull();
  });

  it("returns null for opaque non-JWT tokens", () => {
    expect(getAuth0ProviderFromToken("auth0-access-token")).toBeNull();
    expect(getAuth0ProviderFromToken("")).toBeNull();
  });

  it("returns null for malformed JWT payloads", () => {
    expect(getAuth0ProviderFromToken("header.!!!not-base64!!!.sig")).toBeNull();
    expect(
      getAuth0ProviderFromToken(`header.${btoa("not json")}.sig`),
    ).toBeNull();
  });
});
