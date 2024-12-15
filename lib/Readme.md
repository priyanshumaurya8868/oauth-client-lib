# 🛠️ **OAuth Client Library**

A lightweight JavaScript library for handling **OAuth 2.0 authentication** flows, token management, and auto-refreshing access tokens.

## 🚀 **Features**

- Simple OAuth 2.0 Authorization Code Flow
- Access Token and Refresh Token Management
- Auto-refresh of Expiring Tokens
- Token Revocation Support
- Works in both **browser** and **Node.js** environments

## 📦 **Installation**

Install via npm:

```bash
npm install oauth-client-lib
```

## 📖 **Usage**

### 1. **Import the Library**

```javascript
import OAuthClient from 'oauth-client-lib';
```

### 2. **Initialize the Client**

```javascript
const client = new OAuthClient({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
  authUrl: 'https://your-auth-domain/authorize',
  tokenUrl: 'https://your-auth-domain/oauth/token',
  revokeUrl: 'https://your-auth-domain/oauth/revoke',
  clientSecret: 'your-client-secret', // Optional for localhost
});
```

### 3. **Start the Authentication Flow**

Redirect the user to the OAuth provider's login page:

```javascript
client.startAuthFlow();
```

### 4. **Handle the Callback**

Exchange the authorization code for an access token:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  try {
    const tokenData = await client.handleCallback(code);
    console.log('Token Data:', tokenData);
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

### 5. **Refresh the Token**

Manually refresh the access token:

```javascript
await client.refreshToken();
```

### 6. **Logout and Revoke Tokens**

Log the user out and revoke tokens:

```javascript
await client.logout();
```

## 📝 **API Reference**

### `OAuthClient(options)`

#### **Options**

| Option         | Type     | Description                                       |
|----------------|----------|---------------------------------------------------|
| `clientId`     | `string` | Your OAuth client ID                              |
| `redirectUri`  | `string` | Redirect URI after authentication                 |
| `authUrl`      | `string` | Authorization URL                                 |
| `tokenUrl`     | `string` | Token endpoint URL                                |
| `revokeUrl`    | `string` | Token revocation endpoint URL                     |
| `clientSecret` | `string` | Your OAuth client secret (optional for localhost) |

### **Methods**

#### `startAuthFlow()`

Starts the OAuth 2.0 authorization flow.

#### `handleCallback(code)`

Handles the callback from the OAuth provider and exchanges the code for an access token.

#### `refreshToken()`

Refreshes the access token using the refresh token.

#### `logout()`

Logs out the user and revokes tokens.

## 🌐 **Compatibility**

- **Browsers**: Requires `axios` to be included via CDN.
- **Node.js**: Compatible with Node.js environments.

## 🔒 **Client Secret**

- **Client Secret** is **optional** for local development with `localhost`.
- For production or server-side applications, including a **Client Secret** is recommended for secure communication with the OAuth provider.

## 📄 **License**

MIT License © 2024 Your Name
