import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./providers/theme-provider.tsx";
import { PlanAuthProvider } from "./config/auth-context.tsx";
import {
  BackendFetch,
  DevTools,
  FormatSimple,
  Tolgee,
  TolgeeProvider,
} from "@tolgee/react";
import { LANGUAGE } from "./lib/constant.ts";

const queryClient = new QueryClient();
const defaultLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE || "bo-IN";
const tolgee = new (Tolgee as any)()
  .use(DevTools)
  .use(FormatSimple)
  .use(
    BackendFetch({
      prefix:
        "https://cdn.tolg.ee/300fa406912d362adee8a983f8f4682d/reactjs_json",
      fallbackOnFail: true,
    }),
  )
  .init({
    language: localStorage.getItem(LANGUAGE) || defaultLanguage,
    fallbackLanguage: "en",
  });
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider tolgee={tolgee}>
          <PlanAuthProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <App />
            </ThemeProvider>
          </PlanAuthProvider>
        </TolgeeProvider>
      </QueryClientProvider>
    </StrictMode>
  </BrowserRouter>,
);
