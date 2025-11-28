import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Importing the main CSS file
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-w56gizp12r4v237u.us.auth0.com"
      clientId="KBEhUkv4ZYVYHHgLF3N4tM94X7mARa8q"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);