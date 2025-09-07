import "@testing-library/jest-dom";
import { vi } from "vitest";

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
}));

Object.defineProperty(global, "URL", {
  value: {
    createObjectURL: vi.fn(() => "mock-blob-url"),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

