import OAuthClient from '../lib/oauthClient.js';

const CLIENT_ID  = "9wz6fewBMcSuEtMmlLNHu5aS5Fw2L1jp"
const DOMAIN = "dev-tinj28mfna224mob.us.auth0.com";  
const REDIRECT_URI = 'http://localhost:3000/demo/index.html'

const client = new OAuthClient({
  clientId: CLIENT_ID, 
  redirectUri: REDIRECT_URI, 
  authUrl: `https://${DOMAIN}/authorize`,
  tokenUrl: `https://${DOMAIN}/oauth/token` 
});

const loginButton = document.getElementById('login-button');
const userInfoDiv = document.getElementById('user-info');

loginButton.addEventListener('click', () => {
  client.startAuthFlow();
});

window.addEventListener('load', async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (code) {
    try {
      const tokenData = await client.handleCallback(code);
      userInfoDiv.textContent = `Access Token: ${tokenData.access_token}`;
    } catch (error) {
        console.log(error)
      userInfoDiv.textContent = 'Failed to authenticate.';
    }
  }
});
