class OAuthClient {
    constructor({
      clientId = process.env.CLIENT_ID,
      redirectUri = process.env.REDIRECT_URI,
      authUrl = process.env.AUTH_URL,
      tokenUrl = process.env.TOKEN_URL,
      revokeUrl = process.env.REVOKE_URL,
    }) {
      this.clientId = clientId;
      this.redirectUri = redirectUri;
      this.authUrl = authUrl;
      this.tokenUrl = tokenUrl;
      this.revokeUrl = revokeUrl;
      this.axiosInstance = null;
      this.tokenData = null; // To store token data
      this.refreshInterval = null; // To store the auto-refresh interval ID
    }
  
    async loadAxios() {
      if (!this.axiosInstance) {
        if (typeof window !== "undefined") {
          if (!window.axios) {
            throw new Error("Axios is not loaded in the browser. Please include it via CDN.");
          }
          this.axiosInstance = window.axios;
        } else {
          const axiosModule = await import("axios");
          this.axiosInstance = axiosModule.default;
        }
      }
    }
  
    async startAuthFlow() {
      const token = await this.getToken();
      if (token && token.access_token) {
        console.log("Already authenticated.");
        return;
      }
  
      const authUrl = `${this.authUrl}?response_type=code&client_id=${
        this.clientId
      }&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=openid offline_access`;
  
      if (typeof window !== "undefined") {
        window.location.href = authUrl;
      } else {
        return authUrl;
      }
    }
  
    async handleCallback(code) {
      await this.loadAxios();
  
      try {
        const response = await this.axiosInstance.post(this.tokenUrl, {
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          grant_type: "authorization_code",
        });
  
        this.tokenData = response.data;
  
        if (!this.tokenData.issued_at) {
          this.tokenData.issued_at = Date.now();
        }
  
        this.storeToken(this.tokenData);
        await this.startAutoRefresh(); // Start auto-refresh after handling callback
        return this.tokenData;
      } catch (error) {
        console.error("Error exchanging code for token:", error);
        throw error;
      }
    }
  
    storeToken(tokenData) {
      if (typeof window !== "undefined") {
        localStorage.setItem("oauth_token", JSON.stringify(tokenData));
      } else {
        this.tokenData = tokenData;
      }
    }
  
    async getToken() {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("oauth_token");
        if (token) {
          const parsedToken = JSON.parse(token);
          const now = Date.now();
          if (parsedToken.issued_at && parsedToken.expires_in) {
            const expiresAt = parsedToken.issued_at + parsedToken.expires_in * 1000;
            if (now >= expiresAt) {
              console.warn("Token has expired.");
              await this.logout();
              return null;
            }
          }
          return parsedToken;
        }
      }
      return this.tokenData;
    }
  
    async refreshToken() {
      await this.loadAxios();
      const token = await this.getToken();
  
      if (token && token.refresh_token) {
        try {
          const response = await this.axiosInstance.post(this.tokenUrl, {
            client_id: this.clientId,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
          });
  
          this.tokenData = response.data;
  
          if (!this.tokenData.issued_at) {
            this.tokenData.issued_at = Date.now();
          }
  
          this.storeToken(this.tokenData);
          console.log("Token refreshed successfully:", this.tokenData);
          return this.tokenData;
        } catch (error) {
          console.error("Error refreshing token:", error);
          throw error;
        }
      } else {
        console.warn("No refresh token available.");
      }
    }
  
    async startAutoRefresh() {
      if (this.refreshInterval) {
        clearTimeout(this.refreshInterval);
      }
  
      const token = await this.getToken();
  
      if (token && token.expires_in) {
        const expiresInMs = token.expires_in * 1000;
        const bufferTime = 60 * 1000;
  
        this.refreshInterval = setTimeout(async () => {
          try {
            await this.refreshToken();
            await this.startAutoRefresh(); // Schedule the next refresh after a successful refresh
          } catch (error) {
            console.error("Auto-refresh failed:", error);
          }
        }, expiresInMs - bufferTime);
      }
    }
  
    async revokeToken(token) {
      await this.loadAxios();
  
      if (!this.revokeUrl) {
        console.warn("Revoke URL is not provided.");
        return;
      }
  
      try {
        await this.axiosInstance.post(this.revokeUrl, {
          token: token,
          client_id: this.clientId,
        });
        console.log("Token revoked successfully.");
      } catch (error) {
        console.error("Error revoking token:", error);
      }
    }
  
    async logout() {
      const token = await this.getToken();
  
      if (token) {
        if (token.access_token) {
          await this.revokeToken(token.access_token);
        }
        if (token.refresh_token) {
          await this.revokeToken(token.refresh_token);
        }
      }
  
      if (typeof window !== "undefined") {
        localStorage.removeItem("oauth_token");
      }
  
      this.tokenData = null;
  
      if (this.refreshInterval) {
        clearTimeout(this.refreshInterval);
        this.refreshInterval = null;
      }
  
      console.log("Logged out successfully.");
    }
  }
  
  export default OAuthClient;  