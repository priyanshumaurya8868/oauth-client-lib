// import axios from "axios";

class OAuthClient {
    constructor({ clientId, redirectUri, authUrl, tokenUrl }) {
      this.clientId = clientId;
      this.redirectUri = redirectUri;
      this.authUrl = authUrl;
      this.tokenUrl = tokenUrl;
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
      window.location.href = url;
    }
  
    async handleCallback(code) {
        await this.loadAxios(); // Ensure axios is loaded
      try {
        const response = await axios.post(this.tokenUrl, {
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          grant_type: 'authorization_code'
        });
        return response.data;
      } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw error;
      }
    }
  }
  
  export default OAuthClient;
  