"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  checkUserPermissions,
  saveUserPermissions,
} from "@/utils/permissionService";

// Interface for user information
interface UserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const router = useRouter();

  const NEXT_PUBLIC_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Fungsi logout
  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_info");
    Cookies.remove("token_expiry");
    setIsLoggedIn(false);
    setUserInfo(null);
    setError(null);
  };

  // Function to check if an existing token is valid and load user info
  const checkExistingAuth = () => {
    const accessToken = Cookies.get("auth_token");
    const storedUserInfo = Cookies.get("user_info");
    const tokenExpiry = Cookies.get("token_expiry");

    if (!accessToken || !storedUserInfo || !tokenExpiry) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > parseInt(tokenExpiry, 10)) {
      logout();
      return false;
    }

    try {
      setUserInfo(JSON.parse(storedUserInfo));
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("Error parsing user info:", error);
      logout();
      return false;
    }
  };

  // Function to fetch user information with the access token
  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const userData = await response.json();

      const userInfo: UserInfo = {
        sub: userData.sub,
        email: userData.email,
        email_verified: userData.email_verified,
        name: userData.name,
        picture: userData.picture,
        given_name: userData.given_name,
        family_name: userData.family_name,
      };

      setUserInfo(userInfo);

      // Store user info in cookie
      Cookies.set("user_info", JSON.stringify(userInfo), {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return userInfo;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  };

  // Function to initialize Google auth
  const initializeGoogleAuth = () => {
    // If the Google API is not loaded yet, load it
    if (
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      )
    ) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = setupGoogleAuth;
    script.onerror = () => {
      setError("Failed to load Google authentication");
      setIsLoading(false);
    };
    document.body.appendChild(script);
  };

  // Setup Google authentication after script loads
  const setupGoogleAuth = () => {
    // @ts-ignore
    if (!window.google) {
      setError("Google API failed to load");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };

  // Handle the login button click
  const handleLoginClick = () => {
    // @ts-ignore
    if (!window.google?.accounts?.oauth2) {
      setError("Google OAuth not available. Please refresh the page.");
      return;
    }

    // @ts-ignore
    window.google.accounts.oauth2
      .initTokenClient({
        client_id: NEXT_PUBLIC_CLIENT_ID,
        // Request sign-in, Google Sheets, and Google Docs permissions
        scope:
          "email profile https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file",
        callback: handleAuthSuccess,
        error_callback: handleAuthError,
      })
      .requestAccessToken();
  };

  // Handle successful authentication
  const handleAuthSuccess = async (response: any) => {
    try {
      setIsLoading(true);

      if (!response?.access_token) {
        throw new Error("No access token received");
      }

      const accessToken = response.access_token;
      const expiryTime = Date.now() + response.expires_in * 1000;

      // Save the access token and expiry
      Cookies.set("auth_token", accessToken, {
        expires: new Date(expiryTime),
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      Cookies.set("token_expiry", expiryTime.toString(), {
        expires: new Date(expiryTime),
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Fetch user info and update state
      await fetchUserInfo(accessToken);
      setIsLoggedIn(true);

      // Check user permissions
      const permissions = await checkUserPermissions();
      saveUserPermissions(permissions);

      // Show warning if user doesn't have necessary permissions
      if (!permissions.hasSpreadsheetAccess && !permissions.hasDocsAccess) {
        setPermissionError(
          "Akun Anda tidak memiliki akses ke spreadsheet atau dokumen yang diperlukan. Silakan hubungi administrator untuk mendapatkan akses."
        );
        return;
      } else if (!permissions.hasSpreadsheetAccess) {
        setPermissionError(
          "Akun Anda tidak memiliki akses ke spreadsheet data penduduk. Fitur data penduduk akan terbatas."
        );
      } else if (!permissions.hasDocsAccess) {
        setPermissionError(
          "Akun Anda tidak memiliki akses ke dokumen template. Fitur pembuatan surat akan terbatas."
        );
      }

      // Redirect to dashboard after successful login
      router.push("/");
    } catch (error) {
      console.error("Authentication error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication errors
  const handleAuthError = (error: any) => {
    console.error("Google authentication error:", error);
    setError(`Authentication failed: ${error.type || "unknown error"}`);
  };

  // Initial setup
  useEffect(() => {
    if (!checkExistingAuth()) {
      initializeGoogleAuth();
    } else {
      setIsLoading(false);
      // If already authenticated, redirect will be handled by middleware
      router.push("/");
    }

    // Setup auto-logout when token expires
    const tokenExpiry = Cookies.get("token_expiry");
    if (tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);
      const timeUntilExpiry = expiryTime - Date.now();

      if (timeUntilExpiry > 0) {
        const logoutTimer = setTimeout(() => {
          logout();
          setError("Session has expired, please log in again");
        }, timeUntilExpiry);

        return () => clearTimeout(logoutTimer);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/assets/login/bg-login.png')] bg-cover bg-no-repeat bg-bottom lg:bg-bottom-right text-black p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        {/* SIRANTEN Logo and Branding */}
        <div className="mb-2">
          <div className="flex justify-center">
            <Image
              src="/assets/logo-siranten.svg"
              alt="Logo SIRANTEN"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2">SIRANTEN</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>Sistem Informasi Persuratan Ngabeyan</strong>
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {permissionError && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
              {permissionError}
            </div>
          )}

          <button
            onClick={handleLoginClick}
            className="w-full bg-white border border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white font-bold py-3 px-4 rounded transition duration-200 flex items-center justify-center gap-2"
          >
            <svg
              width="18"
              height="18"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Login dengan Google
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Dengan login, Anda menyetujui penggunaan cookies untuk menyimpan
            sesi login dan memberikan akses ke Google Sheets.
          </p>
        </div>
      </div>

      {/* Credits Section */}
      <div className="mt-8 bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md w-full max-w-md">
        <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
          Dipersembahkan oleh:
        </p>
        <div className="flex justify-center items-start gap-2">
          {/* Logo KKN-PPM */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-14 h-14 relative mb-2">
              <Image
                src="/assets/logo-kkn.png"
                alt="Logo KKN-PPM UGM"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-600 text-center leading-tight">
              KKN-PPM UGM
            </p>
          </div>

          {/* Logo UGM */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-14 h-14 relative mb-2">
              <Image
                src="/assets/logo-ugm.png"
                alt="Logo Universitas Gadjah Mada"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-600 text-center leading-tight">
              Universitas Gadjah Mada
            </p>
          </div>

          {/* Logo Pijak Karanganom */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-14 h-14 relative mb-2">
              <Image
                src="/assets/logo-pijakKaranganom-nobg.png"
                alt="Logo Pijak Karanganom"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xs text-gray-600 text-center leading-tight">
              Pijak Karanganom
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Kuliah Kerja Nyata - Pembelajaran Pemberdayaan Masyarakat
        </p>
      </div>
    </div>
  );
}
