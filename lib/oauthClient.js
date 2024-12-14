class OAuthClient {
    constructor({ clientId, redirectUri, authUrl, tokenUrl, revokeUrl }) {
      this.clientId = clientId;
      this.redirectUri = redirectUri;
      this.authUrl = authUrl;
      this.tokenUrl = tokenUrl;
      this.revokeUrl = revokeUrl;
      this.axiosInstance = null;
      this.tokenData = null; // To store token data
    }
  
    async loadAxios() {
        if (!this.axiosInstance) {
          if (typeof window !== 'undefined') {
            // In browser: use axios from CDN
            this.axiosInstance = window.axios;
          } else {
            // In Node.js: dynamically import axios
            const axiosModule = await import('axios');
            this.axiosInstance = axiosModule.default;
          }
        }
      }
  
    startAuthFlow() {
      const url = `${this.authUrl}?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
      if (typeof window !== 'undefined') {
        window.location.href = url;
      } else {
        throw new Error('startAuthFlow can only be called in a browser environment.');
      }
    }
  
    async handleCallback(code) {
      await this.loadAxios();
  
      try {
        const response = await this.axiosInstance.post(this.tokenUrl, {
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          grant_type: 'authorization_code'
        });
  
        this.tokenData = response.data;
        this.storeToken(this.tokenData);
        return this.tokenData;
      } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw error;
      }
    }
  
    storeToken(tokenData) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('oauth_token', JSON.stringify(tokenData));
      } else {
        this.tokenData = tokenData; // For server-side storage
      }
    }
  
    getToken() {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('oauth_token');
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
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token
          });
  
          this.tokenData = response.data;
          this.storeToken(this.tokenData);
          console.log('Token refreshed successfully:', this.tokenData);
          return this.tokenData;
        } catch (error) {
          console.error('Error refreshing token:', error);
          throw error;
        }
      } else {
        console.warn('No refresh token available.');
      }
    }
  
    logout() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oauth_token');
      }
      this.tokenData = null;
      console.log('Logged out successfully.');
    }
  }
  
  export default OAuthClient;
  