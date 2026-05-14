import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert, Platform } from "react-native";

type GoogleUserInfo = {
  email: string;
  name: string;
  sub: string; 
  picture?: string;
};

type AuthResponse = {
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
};

type BackendResponse = {
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
};


const googleConfig = {
  expoClientId:
    "351954671533-47171m4v12medku986jafh69pbne4v9t.apps.googleusercontent.com",
  iosClientId:
    "351954671533-47171m4v12medku986jafh69pbne4v9t.apps.googleusercontent.com",
  androidClientId:
    "351954671533-47171m4v12medku986jafh69pbne4v9t.apps.googleusercontent.com",
  webClientId:
    "351954671533-47171m4v12medku986jafh69pbne4v9t.apps.googleusercontent.com",
  scopes: ["profile", "email"],
};

export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "gymbro",
      path: "auth/google",
    });
    
    console.log('========== GOOGLE AUTH DEBUG ==========');
    console.log('1. REDIRECT URI:', redirectUri);
    console.log('2. SCHEME:', "gymbro");
    console.log('3. PATH:', "auth/google");
    console.log('4. PLATFORM:', Platform.OS);
    console.log('5. CLIENT ID:', googleConfig.webClientId);
    
    Alert.alert(
      "Redirect URI", 
      `Copie cette URI dans Google Console:\n\n${redirectUri}`,
      [{ text: "OK" }]
    );

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleConfig.webClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent("email profile")}&` +
      `prompt=select_account`;

    console.log('6. AUTH URL:', authUrl);
    console.log('=======================================');

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    console.log('7. RESULT TYPE:', result.type);
    
    if (result.type === "success") {
      console.log('8. RESULT URL:', result.url);
      
      const params = new URLSearchParams(result.url.split("#")[1]);
      const accessToken = params.get("access_token");
      const error = params.get("error");

      if (error) {
        console.error('9. OAUTH ERROR:', error);
        return { success: false, error: `Google error: ${error}` };
      }

      if (accessToken) {
        console.log('9. ACCESS TOKEN RECEIVED');
        
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (!userInfoResponse.ok) {
          console.error('10. USER INFO ERROR:', userInfoResponse.status);
          return { success: false, error: "Failed to get user info" };
        }

        const userInfo = (await userInfoResponse.json()) as GoogleUserInfo;
        console.log('10. USER INFO:', userInfo.email);

        const response = await fetch(
          "https://gymbro-api-sn0e.onrender.com/api/auth/google",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userInfo.email,
              name: userInfo.name,
              googleId: userInfo.sub,
            }),
          },
        );

        const data = (await response.json()) as BackendResponse;
        console.log('11. BACKEND RESPONSE:', data.success ? 'SUCCESS' : 'FAILED');

        if (response.ok && data.token) {
          await AsyncStorage.setItem("userToken", data.token);
          await AsyncStorage.setItem("userData", JSON.stringify(data.user));
          console.log('12. LOGIN SUCCESSFUL');
          return { success: true, user: data.user };
        } else {
          console.error('12. BACKEND ERROR:', data.error);
          return { success: false, error: data.error || "Backend authentication failed" };
        }
      } else {
        console.error('9. NO ACCESS TOKEN IN RESPONSE');
        return { success: false, error: "No access token received" };
      }
    } else if (result.type === "cancel") {
      console.log('8. USER CANCELLED');
      return { success: false, error: "Sign in was cancelled" };
    } else if (result.type === "dismiss") {
      console.log('8. USER DISMISSED');
      return { success: false, error: "Sign in was dismissed" };
    } else {
      console.error('8. UNKNOWN RESULT:', result);
      return { success: false, error: "Authentication failed" };
    }
  } catch (error) {
    console.error('❌ Google Sign In error:', error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
};
export const signInWithApple = async (): Promise<AuthResponse> => {
  if (Platform.OS !== "ios") {
    return {
      success: false,
      error: "Apple Sign In is only available on iOS devices",
    };
  }

  try {
    const { AppleAuthentication } = require("expo-apple-authentication");

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const response = await fetch("https://gymbro-api-sn0e.onrender.com/api/auth/apple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credential.email,
        name: credential.fullName?.givenName,
        appleId: credential.user,
      }),
    });

    const data = (await response.json()) as BackendResponse;

    if (response.ok && data.token) {
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(data.user));
      return { success: true, user: data.user };
    }

    return { success: false, error: "Authentication failed" };
  } catch (error: any) {
    console.error("Apple Sign In error:", error);
    if (error.code === "ERR_REQUEST_CANCELED") {
      return { success: false, error: "Sign in was cancelled" };
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
};

export const isAppleSignInAvailable = (): boolean => {
  return Platform.OS === "ios";
};
