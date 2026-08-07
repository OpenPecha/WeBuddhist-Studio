import {
  Auth0Provider,
  useAuth0,
  type AppState,
  type LogoutOptions,
  type RedirectLoginOptions,
} from "@auth0/auth0-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  AUTH0_INTENT,
  getAuth0Config,
  setAuth0Intent,
} from "@/config/auth0-config";

type StudioAuth0Value = {
  isConfigured: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>;
  getAccessTokenSilently: (options?: {
    authorizationParams?: { audience?: string };
  }) => Promise<string>;
  logout: (options?: LogoutOptions) => void;
};

const StudioAuth0Context = createContext<StudioAuth0Value | null>(null);

const unconfiguredAuth0: StudioAuth0Value = {
  isConfigured: false,
  isAuthenticated: false,
  isLoading: false,
  loginWithRedirect: async () => {
    throw new Error("Phone login is not configured.");
  },
  getAccessTokenSilently: async () => {
    throw new Error("Phone login is not configured.");
  },
  logout: () => undefined,
};

function Auth0ConfiguredBridge({
  children,
}: Readonly<{ children: ReactNode }>) {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
    logout,
  } = useAuth0();

  const value = useMemo<StudioAuth0Value>(
    () => ({
      isConfigured: true,
      isAuthenticated,
      isLoading,
      loginWithRedirect,
      getAccessTokenSilently: async (options) => {
        const token = await getAccessTokenSilently(options as never);
        if (typeof token === "string") {
          return token;
        }
        return token.access_token;
      },
      logout,
    }),
    [
      getAccessTokenSilently,
      isAuthenticated,
      isLoading,
      loginWithRedirect,
      logout,
    ],
  );

  return (
    <StudioAuth0Context.Provider value={value}>
      {children}
    </StudioAuth0Context.Provider>
  );
}

function handleAuth0RedirectCallback(appState?: AppState) {
  const intent =
    typeof appState?.intent === "string" ? appState.intent : undefined;
  if (
    intent === AUTH0_INTENT.phoneLogin ||
    intent === AUTH0_INTENT.phoneLink ||
    intent === AUTH0_INTENT.googleLogin
  ) {
    setAuth0Intent(intent);
  }

  const returnTo =
    typeof appState?.returnTo === "string"
      ? appState.returnTo
      : window.location.pathname;
  window.history.replaceState({}, document.title, returnTo);
}

export function StudioAuth0Provider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const config = getAuth0Config();

  if (!config.isConfigured) {
    return (
      <StudioAuth0Context.Provider value={unconfiguredAuth0}>
        {children}
      </StudioAuth0Context.Provider>
    );
  }

  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(config.audience ? { audience: config.audience } : {}),
        scope: "openid profile email",
      }}
      cacheLocation="memory"
      onRedirectCallback={handleAuth0RedirectCallback}
    >
      <Auth0ConfiguredBridge>{children}</Auth0ConfiguredBridge>
    </Auth0Provider>
  );
}

export function useStudioAuth0(): StudioAuth0Value {
  const context = useContext(StudioAuth0Context);
  if (!context) {
    throw new Error("useStudioAuth0 must be used within StudioAuth0Provider");
  }
  return context;
}

export function useStudioAuth0Logout() {
  const { isConfigured, isAuthenticated, logout } = useStudioAuth0();

  return useCallback(
    (returnTo: string) => {
      if (isConfigured && isAuthenticated) {
        logout({
          logoutParams: { returnTo },
        });
      }
    },
    [isAuthenticated, isConfigured, logout],
  );
}
