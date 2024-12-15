class OAuthClient {
  constructor({
    clientId = process.env.CLIENT_ID,
    clientSecret = process.env.CLIENT_SECRET, // Added clientSecret
    redirectUri = process.env.REDIRECT_URI,
    authUrl = process.env.AUTH_URL,
    tokenUrl = process.env.TOKEN_URL,
    revokeUrl = process.env.REVOKE_URL,
  }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret; // Store clientSecret
    this.redirectUri = redirectUri;
    this.authUrl = authUrl;
    this.tokenUrl = tokenUrl;
    this.revokeUrl = revokeUrl;
    this.axiosInstance = null;
    this.tokenData = null;
    this.refreshInterval = null;
  }

  async loadAxios() {
    if (!this.axiosInstance) {
      if (typeof window !== "undefined") {
        if (!window.axios) {
          throw new Error(
            "Axios is not loaded in the browser. Please include it via CDN."
          );
        }
        this.axiosInstance = window.axios;
      } else {
        const axiosModule = await import("axios");
        this.axiosInstance = axiosModule.default;
      }
    }
  }

  async handleCallback(code) {
    await this.loadAxios();

    try {
      const response = await this.axiosInstance.post(this.tokenUrl, {
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret, // Added clientSecret
        grant_type: "authorization_code",
      });

      this.tokenData = response.data;

      if (!this.tokenData.issued_at) {
        this.tokenData.issued_at = Date.now();
      }

      this.storeToken(this.tokenData);
      await this.startAutoRefresh();
      return this.tokenData;
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      throw error;
    }
  }

  async refreshToken() {
    await this.loadAxios();
    const token = await this.getToken();

    if (token && token.refresh_token) {
      try {
        const response = await this.axiosInstance.post(this.tokenUrl, {
          client_id: this.clientId,
          client_secret: this.clientSecret, // Added clientSecret
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

  // Other methods remain unchanged...
}

export default OAuthClient;
