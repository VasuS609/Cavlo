import React, { useState, useEffect, createContext, useContext } from 'react';
import { Shield, LogOut, User, CheckCircle, XCircle } from 'lucide-react';

// Auth Context
const AuthContext = createContext(null);

// Auth0 Configuration - REPLACE THESE WITH YOUR VALUES
const AUTH0_CONFIG = {
  domain: 'dev-ws6gjzp12r4v237u.us.auth0.com', // Your Auth0 domain
  clientId: 'KBEhUkv4ZYVYHHgLF3N4tM94X7mARa8q', // Replace with your actual client ID
  redirectUri: window.location.origin + '/callback',
  logoutUri: window.location.origin,
  audience: '', // Optional: Your API audience if using one
};

// Auth Provider Component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we're on the callback page
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');

    if (errorParam) {
      setError(errorDescription || errorParam);
      setLoading(false);
      // Clean URL
      window.history.replaceState({}, document.title, '/');
      return;
    }

    if (code && state) {
      handleCallback(code, state);
    } else {
      // Check for existing session
      const storedUser = localStorage.getItem('auth0_user');
      const storedToken = localStorage.getItem('auth0_token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, []);

  const handleCallback = async (code, state) => {
    try {
      // Verify state matches
      const savedState = sessionStorage.getItem('auth0_state');
      if (state !== savedState) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      // Exchange code for tokens
      const tokenResponse = await exchangeCodeForToken(code);
      
      // Get user info
      const userInfo = await getUserInfo(tokenResponse.access_token);
      
      // Store tokens and user info
      localStorage.setItem('auth0_token', tokenResponse.access_token);
      localStorage.setItem('auth0_id_token', tokenResponse.id_token);
      localStorage.setItem('auth0_user', JSON.stringify(userInfo));
      
      setUser(userInfo);
      setError(null);
      
      // Clean up
      sessionStorage.removeItem('auth0_state');
      sessionStorage.removeItem('auth0_code_verifier');
      
      // Redirect to home
      window.history.replaceState({}, document.title, '/');
    } catch (err) {
      setError(err.message);
      console.error('Auth callback error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exchangeCodeForToken = async (code) => {
    const codeVerifier = sessionStorage.getItem('auth0_code_verifier');
    
    const response = await fetch(`https://${AUTH0_CONFIG.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: AUTH0_CONFIG.clientId,
        code,
        redirect_uri: AUTH0_CONFIG.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    return response.json();
  };

  const getUserInfo = async (accessToken) => {
    const response = await fetch(`https://${AUTH0_CONFIG.domain}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  };

  const login = async () => {
    try {
      // Generate PKCE values
      const codeVerifier = generateRandomString(43);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(32);

      // Store for callback
      sessionStorage.setItem('auth0_code_verifier', codeVerifier);
      sessionStorage.setItem('auth0_state', state);

      // Build authorization URL
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: AUTH0_CONFIG.clientId,
        redirect_uri: AUTH0_CONFIG.redirectUri,
        scope: 'openid profile email',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      if (AUTH0_CONFIG.audience) {
        params.append('audience', AUTH0_CONFIG.audience);
      }

      // Redirect to Auth0
      window.location.href = `https://${AUTH0_CONFIG.domain}/authorize?${params}`;
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('auth0_token');
    localStorage.removeItem('auth0_id_token');
    localStorage.removeItem('auth0_user');
    setUser(null);

    // Redirect to Auth0 logout
    const params = new URLSearchParams({
      client_id: AUTH0_CONFIG.clientId,
      returnTo: AUTH0_CONFIG.logoutUri,
    });

    window.location.href = `https://${AUTH0_CONFIG.domain}/v2/logout?${params}`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Utility functions
function generateRandomString(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').substring(0, length);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Custom hook
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Main App Component
function App() {
  const { user, loading, error, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Auth0 Integration</h1>
            <p className="text-slate-400">Secure authentication with Auth0</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Authentication Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Main Content Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-2xl">
            {!user ? (
              // Login State
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
                  <p className="text-slate-400">Sign in to access your account</p>
                </div>

                <button
                  onClick={login}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Sign In with Auth0
                </button>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    ⚠️ <strong>Setup Required:</strong> Replace <code className="bg-slate-700 px-1 py-0.5 rounded">YOUR_CLIENT_ID</code> in the code with your actual Auth0 Client ID
                  </p>
                </div>
              </div>
            ) : (
              // Logged In State
              <div>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-16 h-16 rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
                    <p className="text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-slate-300">Successfully authenticated</span>
                  </div>
                  
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">User Information</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-300"><span className="text-slate-400">User ID:</span> {user.sub}</p>
                      <p className="text-slate-300"><span className="text-slate-400">Email Verified:</span> {user.email_verified ? 'Yes' : 'No'}</p>
                      {user.nickname && (
                        <p className="text-slate-300"><span className="text-slate-400">Nickname:</span> {user.nickname}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>Powered by Auth0 with PKCE flow for enhanced security</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Root component
export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}