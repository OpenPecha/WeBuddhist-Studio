import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

afterEach(() => {
  document.body.removeAttribute("data-scroll-locked");
  document.body.style.pointerEvents = "";
});

vi.mock("@/config/auth-context", () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    isLoggedIn: false,
    isAuthLoading: false,
  }),
}));

vi.mock("@/config/axios-config", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@tolgee/react", () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
  useTolgee: () => ({
    getLanguage: () => "en",
    changeLanguage: vi.fn(),
  }),
}));

vi.mock("@/hooks/useUserInfo", () => ({
  USER_INFO_QUERY_KEY: ["userInfo"],
  fetchUserInfo: vi.fn(),
  useUserInfo: () => ({
    data: {
      id: "test-user-id",
      email: "test@example.com",
      platform_role: "SUPER_ADMIN",
      is_verified: true,
      is_active: true,
      has_group: true,
      can_create_content: true,
    },
    isLoading: false,
  }),
}));

Object.defineProperty(global, "URL", {
  value: {
    createObjectURL: vi.fn(() => "mock-blob-url"),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
