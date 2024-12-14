class OAuthClient {
    constructor({ clientId, redirectUri, authUrl, tokenUrl, revokeUrl }) {
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
  
    startAuthFlow() {
      const url = `${this.authUrl}?response_type=code&client_id=${
        this.clientId
      }&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=openid offline_access`;
  
      if (typeof window !== "undefined") {
        window.location.href = url;
      } else {
        throw new Error("startAuthFlow can only be called in a browser environment.");
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
        this.startAutoRefresh(); // Start auto-refresh after handling callback
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
  
    getToken() {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("oauth_token");
        return token ? JSON.parse(token) : null;
      }
      return this.tokenData;
    }
  
    async refreshToken() {
      await this.loadAxios();
      const token = this.getToken();
  
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
  
    startAutoRefresh() {
      // Clear any existing interval to avoid multiple timers
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
  
      const token = this.getToken();
  
      if (token && token.expires_in) {
        const expiresInMs = token.expires_in * 1000; // Convert to milliseconds
        const bufferTime = 60 * 1000; // Refresh 1 minute before expiration
  
        // Set interval to refresh the token before it expires
        this.refreshInterval = setTimeout(async () => {
          try {
            await this.refreshToken();
            this.startAutoRefresh(); // Schedule the next refresh after a successful refresh
          } catch (error) {
            console.error("Auto-refresh failed:", error);
          }
        }, expiresInMs - bufferTime);
      }
    }
  
    logout() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("oauth_token");
      }
      this.tokenData = null;
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
      console.log("Logged out successfully.");
    }
  }
  
  export default OAuthClient;
  