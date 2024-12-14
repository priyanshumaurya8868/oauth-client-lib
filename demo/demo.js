import OAuthClient from '../lib/oauthClient.js';

const CLIENT_ID  = "9wz6fewBMcSuEtMmlLNHu5aS5Fw2L1jp"
const DOMAIN = "dev-tinj28mfna224mob.us.auth0.com";  
const REDIRECT_URI = 'http://localhost:3000/demo/index.html'

const TOKEN_URL = `https://${DOMAIN}/oauth/token`;
const REVOKE_URL = `https://${DOMAIN}/oauth/revoke`;

const client = new OAuthClient({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    authUrl: `https://${DOMAIN}/authorize`,
    tokenUrl: TOKEN_URL,
    revokeUrl: REVOKE_URL
  });
  
  const loginButton = document.getElementById('login-button');
  const refreshButton = document.getElementById('refresh-button');
  const logoutButton = document.getElementById('logout-button');
  const userInfoDiv = document.getElementById('user-info');
  
  // Function to display the access token
  function displayToken() {
    const tokenData = client.getToken();
    if (tokenData && tokenData.access_token) {
      userInfoDiv.textContent = `Access Token: ${tokenData.access_token}`;
    } else {
      userInfoDiv.textContent = 'No token found. Please log in.';
    }
  }
  
  // Event listeners
  loginButton.addEventListener('click', () => {
    client.startAuthFlow();
  });
  
  refreshButton.addEventListener('click', async () => {
    try {
      await client.refreshToken();
      displayToken();
    } catch {
      userInfoDiv.textContent = 'Failed to refresh token.';
    }
  });
  
  logoutButton.addEventListener('click', () => {
    client.logout();
    userInfoDiv.textContent = 'Logged out.';
  });
  
  // On page load, check for existing token or handle callback
  window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
  
    if (code) {
      try {
        const tokenData = await client.handleCallback(code);
        displayToken();
      } catch (error) {
        userInfoDiv.textContent = 'Failed to authenticate.';
      }
    } else {
      displayToken();
    }
  });
  