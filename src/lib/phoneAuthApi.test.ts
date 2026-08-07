import { describe, expect, it, vi } from "vitest";
import {
  PROFILE_REQUIRED_DETAIL,
  exchangePhoneToken,
  isPhoneExchangeInactive,
  isProfileRequiredDetail,
  linkPhoneToken,
} from "@/lib/phoneAuthApi";
import axiosInstance from "@/config/axios-config";

describe("phoneAuthApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges an Auth0 token with the backend", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        author_id: "author-1",
        phone_number: "+15551234567",
        status: "ACTIVE",
        message: "Authentication successful",
        user: { name: "Test User" },
        auth: {
          access_token: "access",
          refresh_token: "refresh",
          token_type: "bearer",
        },
      },
    });

    const result = await exchangePhoneToken({
      auth0_token: "auth0-token",
      first_name: "Test",
      last_name: "User",
    });

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/cms/auth/phone/exchange",
      {
        auth0_token: "auth0-token",
        first_name: "Test",
        last_name: "User",
      },
    );
    expect(result.auth?.access_token).toBe("access");
  });

  it("links a phone identity with the current backend session", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        author_id: "author-1",
        phone_number: "+15551234567",
        message: "Phone identity linked",
      },
    });

    const result = await linkPhoneToken("fresh-auth0-token");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/cms/auth/phone/link",
      { auth0_token: "fresh-auth0-token" },
    );
    expect(result.message).toBe("Phone identity linked");
  });

  it("detects profile-required exchange errors", () => {
    expect(isProfileRequiredDetail(PROFILE_REQUIRED_DETAIL)).toBe(true);
    expect(isProfileRequiredDetail("other")).toBe(false);
  });

  it("detects inactive exchange responses", () => {
    expect(
      isPhoneExchangeInactive({
        author_id: "a",
        phone_number: "+1",
        status: "INACTIVE",
        message: "Author not active",
        user: { name: "New User" },
        auth: null,
      }),
    ).toBe(true);

    expect(
      isPhoneExchangeInactive({
        author_id: "a",
        phone_number: "+1",
        status: "ACTIVE",
        message: "Authentication successful",
        user: { name: "Active User" },
        auth: {
          access_token: "a",
          refresh_token: "r",
        },
      }),
    ).toBe(false);
  });
});
