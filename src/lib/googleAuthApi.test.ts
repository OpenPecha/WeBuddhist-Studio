import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  exchangeGoogleToken,
  isGoogleExchangeInactive,
} from "@/lib/googleAuthApi";
import axiosInstance from "@/config/axios-config";

describe("googleAuthApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges an Auth0 Google token with the backend", async () => {
    vi.mocked(axiosInstance.post).mockResolvedValue({
      data: {
        author_id: "author-1",
        email: "ada@example.com",
        status: "ACTIVE",
        message: "Authentication successful",
        user: { name: "Ada Lovelace" },
        auth: {
          access_token: "access",
          refresh_token: "refresh",
          token_type: "bearer",
        },
      },
    });

    const result = await exchangeGoogleToken({
      auth0_token: "auth0-token",
      first_name: "Ada",
      last_name: "Lovelace",
    });

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/cms/auth/google/exchange",
      {
        auth0_token: "auth0-token",
        first_name: "Ada",
        last_name: "Lovelace",
      },
    );
    expect(result.auth?.access_token).toBe("access");
  });

  it("detects inactive exchange responses", () => {
    expect(
      isGoogleExchangeInactive({
        author_id: "a",
        email: "a@example.com",
        status: "INACTIVE",
        message: "Author not active",
        user: { name: "New User" },
        auth: null,
      }),
    ).toBe(true);

    expect(
      isGoogleExchangeInactive({
        author_id: "a",
        email: "a@example.com",
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
