# 🛠️ **OAuth Client Library - Main Repository**

A complete example of how to use the **OAuth Client Library** for handling **OAuth 2.0 authentication** flows, token management, and auto-refreshing access tokens in both **frontend** (browser) and **backend** (server) environments.

## 🚀 **Project Overview**

This repository demonstrates how to:

1. Authenticate users using **OAuth 2.0 Authorization Code Flow**.
2. Manage **access tokens** and **refresh tokens**.
3. Automatically refresh expiring tokens.
4. Implement secure logout and token revocation.

## 📁 **Project Structure**

```
oauth-client-lib/
│
├── demo/                # Frontend demo (HTML + JavaScript)
│   ├── demo.js          # Frontend logic using OAuthClient
│   └── index.html       # HTML for the frontend demo
│
├── lib/                 # OAuth Client Library
│   └── oauthClient.js   # Library source code
│
├── server/              # Backend example (Node.js + Express)
│   └── server.js        # Express server handling OAuth callbacks
│
├── .env                 # Environment variables for the backend
├── package.json         # Project dependencies
└── README.md            # This documentation file
```

## 📦 **Installation**

1. **Clone the repository:**

   ```bash
   git clone https://github.com/priyanshumaurya8868/oauth-client-lib.git
   cd oauth-client-lib
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the `server` directory:**

   ```env
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-client-secret # Optional for localhost
   DOMAIN=your-auth-domain
   REDIRECT_URI=http://localhost:3000/callback
   AUTH_URL=https://your-auth-domain/authorize
   TOKEN_URL=https://your-auth-domain/oauth/token
   REVOKE_URL=https://your-auth-domain/oauth/revoke
   PORT=3000
   ```

4. **Start the server:**

   ```bash
   node server/server.js
   ```

5. **Open the frontend demo:**

   ```bash
   http://localhost:3000/
   ```

## 📖 **Frontend (`demo.js`)**

### **Description**

The `demo.js` file handles the OAuth 2.0 flow in the browser, including:

- Starting the authentication process.
- Displaying access tokens and managing expiration timers.
- Refreshing tokens.
- Logging out users.

### **Code**

```javascript
import OAuthClient from "https://cdn.jsdelivr.net/npm/oauth-client-lib@1.0.2/oauthClient.js";

const CLIENT_ID = "your-client-id";
const DOMAIN = "your-auth-domain";
const REDIRECT_URI = "http://localhost:3000/";

const TOKEN_URL = `https://${DOMAIN}/oauth/token`;
const REVOKE_URL = `https://${DOMAIN}/oauth/revoke`;

const client = new OAuthClient({
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  authUrl: `https://${DOMAIN}/authorize`,
  tokenUrl: TOKEN_URL,
  revokeUrl: REVOKE_URL,
});

const loginButton = document.getElementById("login-button");
const refreshButton = document.getElementById("refresh-button");
const logoutButton = document.getElementById("logout-button");
const userInfoDiv = document.getElementById("user-info");
const timerDiv = document.getElementById("token-timer");

let tokenRefreshInterval;

// Function to display the access token and expiration timer
async function displayToken() {
  const tokenData = await client.getToken();

  if (tokenData && tokenData.access_token) {
    userInfoDiv.textContent = `Access Token: ${tokenData.access_token}`;
    showTokenExpiration(tokenData);
  } else {
    userInfoDiv.textContent = "No token found. Please log in.";
    timerDiv.textContent = "";
  }
}

// Function to show the token expiration countdown
function showTokenExpiration(tokenData) {
  clearInterval(tokenRefreshInterval); // Clear any existing interval

  const expiresIn = tokenData.expires_in; // Token expiration in seconds
  let issuedAt = tokenData.issued_at;

  if (!issuedAt) {
    issuedAt = Date.now();
    tokenData.issued_at = issuedAt;
    client.storeToken(tokenData); // Update localStorage with issued_at
  }

  const expirationTime = issuedAt + expiresIn * 1000;

  function updateTimer() {
    const now = Date.now();
    const remainingTime = Math.max(0, expirationTime - now);

    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);

    timerDiv.textContent = `Token expires in: ${minutes}m ${seconds}s`;

    if (remainingTime <= 0) {
      clearInterval(tokenRefreshInterval);
      timerDiv.textContent = "Token has expired. Please refresh the token.";
      userInfoDiv.textContent = "Token expired. Please log in again.";
    }
  }

  // Update the timer immediately and every second
  updateTimer();
  tokenRefreshInterval = setInterval(updateTimer, 1000);
}

// Event listeners
loginButton.addEventListener("click", async () => {
  await client.startAuthFlow();
});

refreshButton.addEventListener("click", async () => {
  try {
    await client.refreshToken();
    await displayToken();
  } catch {
    userInfoDiv.textContent = "Failed to refresh token.";
    timerDiv.textContent = "";
  }
});

logoutButton.addEventListener("click", async () => {
  await client.logout();
  userInfoDiv.textContent = "Logged out.";
  timerDiv.textContent = "";
  clearInterval(tokenRefreshInterval);
});

// On page load, check for existing token or handle callback
window.addEventListener("load", async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  // Check if a valid token already exists in localStorage
  const existingToken = await client.getToken();

  if (existingToken && existingToken.access_token) {
    await displayToken(); // Display the existing token if available
  } else if (code) {
    try {
      const tokenData = await client.handleCallback(code);
      tokenData.issued_at = Date.now(); // Store the token issuance time
      client.storeToken(tokenData);

      // Remove the code from the URL after successful exchange
      window.history.replaceState({}, document.title, window.location.pathname);

      await displayToken();
    } catch (error) {
      userInfoDiv.textContent = "Failed to authenticate.";
      timerDiv.textContent = "";
      console.error("Error exchanging code for token:", error);
    }
  } else {
    userInfoDiv.textContent = "No token found. Please log in.";
  }
});
```

## 🔒 **Security Considerations**

- **Client Secret:** For localhost development, the `client_secret` is optional. For production, always include the `client_secret` on the server-side to ensure secure communication.


## 📊 **License**

MIT License © 2024 Your Name
