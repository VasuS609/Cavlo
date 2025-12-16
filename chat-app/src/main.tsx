// main.tsx (fixed)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const callbackUrl =
  import.meta.env.VITE_AUTH0_CALLBACK_URL || `${window.location.origin}/callback`;

const renderApp = () => {
  if (auth0Domain && auth0ClientId) {
    return (
      <BrowserRouter>
        <Auth0Provider
          domain={auth0Domain}
          clientId={auth0ClientId}
          authorizationParams={{
            redirect_uri: callbackUrl,
            scope: "openid profile email",
            ...(auth0Audience ? { audience: auth0Audience } : {}),
          }}
        >
          <App />
        </Auth0Provider>
      </BrowserRouter>
    );
  }

  console.warn("Auth0 env vars are missing; running without Auth0 provider");
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {renderApp()}
  </StrictMode>
);