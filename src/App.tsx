import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import Profile from './Profile';
import ChatButton from './ChatButton';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Router } from 'express';
import Chat from './Chat';

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
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
    <div>
      
    <BrowserRouter>
    <Routes>
      <Route path='/chat' element={'Chat'} />
    </Routes>
    </BrowserRouter>

    <div className="app-container overflow-x-autoauto">
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
          <div className="logged-in-section ">
            <div className="logged-in-message">✅ Successfully authenticated!</div>
            <div className="profile-card">
              <Profile />
            </div>
            <ChatButton/>
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
    </div>
  );
}

export default App;