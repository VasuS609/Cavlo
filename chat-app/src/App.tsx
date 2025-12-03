import { useAuth0 } from '@auth0/auth0-react';
import { Routes, Route } from 'react-router-dom';
import LoginButton from './authentication/LoginButton';
import LogoutButton from './authentication/LogoutButton';
import Profile from './authentication/Profile';
import ChatButton from './authentication/ChatButton';
import Chat from './Chat/Chat';




function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  // Debug logging
  console.log('Auth0 State:', { isAuthenticated, isLoading, error });

  if (isLoading) {
    return (
      <div className="app-container">
 
        <div className="loading-state">
          <div className="loading-text">Loading Auth0...</div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            Check browser console for details
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <div className="error-title">Oops!</div>
          <div className="error-message">Something went wrong</div>
          <div className="error-sub-message">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/chat" element={<Chat />} />
      <Route path="/" element={
        <div className="app-container overflow-x-auto">
          <div className="main-card-wrapper"> 
            <img 
              src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png" 
              alt="Auth0 Logo" 
              className="auth0-logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {isAuthenticated ? (
              <div className="logged-in-section">
                <div className="logged-in-message">✅ Successfully authenticated!</div>
                <div className="profile-card">
                  <Profile />
                </div>
                <ChatButton />
                <LogoutButton />
              </div>
            ) : (
              <div className="action-card">
                <p className="action-text">Get started by signing in to your account</p>
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;