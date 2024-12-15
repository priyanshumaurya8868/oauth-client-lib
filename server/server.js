import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import OAuthClient from "../lib/oauthClient.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cookieParser());
app.use(express.json());

const client = new OAuthClient({
  clientId: process.env.CLIENT_ID,
  redirectUri: process.env.REDIRECT_URI,
  authUrl: process.env.AUTH_URL,
  tokenUrl: process.env.TOKEN_URL,
});

// Route to initiate the OAuth flow
app.get("/login", (req, res) => {
  try {
    const authUrl = client.startAuthFlow();
    res.redirect(authUrl);
  } catch (error) {
    console.log("Error :", error);
    res.status(500).send("Error starting auth flow");
  }
});

// Callback route to handle the OAuth provider's response
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokenData = await client.handleCallback(code);
    // The cookie cannot be accessed or modified by JavaScript running in the browser.
    // The cookie can only be sent with HTTP(S) requests between the client and the server.
    res.cookie("access_token", tokenData.access_token, {
      httpOnly: true, // * Works for both HTTP and HTTPS.
      //   secure: true,     // ! Only send cookie over HTTPS
      //   sameSite: 'strict'// ! Prevent CSRF attacks
    });
    res.send("Authentication successful! You can now access protected routes.");
  } catch (error) {
    res.status(500).send("Error handling callback");
  }
});

// Protected route example
app.get("/profile", async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).send("Unauthorized: No token found");
  }

  try {
    res.send("Protected data accessed successfully!");
  } catch (error) {
    res.status(500).send("Error accessing protected data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});