import Cookies from "js-cookie";
import { checkSpreadsheetAccess } from "./spreadsheetService";

export interface UserPermissions {
  hasSpreadsheetAccess: boolean;
  hasDocsAccess: boolean;
  canCreateDocuments: boolean;
}

export async function checkUserPermissions(): Promise<UserPermissions> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    return {
      hasSpreadsheetAccess: false,
      hasDocsAccess: false,
      canCreateDocuments: false,
    };
  }

  try {
    // Check spreadsheet access
    const hasSpreadsheetAccess = await checkSpreadsheetAccess();

    // Check basic docs access by trying to access a test document or checking drive permissions
    const hasDocsAccess = await checkDocsAccess();

    // For document creation, we need drive file creation permissions
    const canCreateDocuments = hasDocsAccess;

    return {
      hasSpreadsheetAccess,
      hasDocsAccess,
      canCreateDocuments,
    };
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return {
      hasSpreadsheetAccess: false,
      hasDocsAccess: false,
      canCreateDocuments: false,
    };
  }
}

async function checkDocsAccess(): Promise<boolean> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    return false;
  }

  try {
    // Check if user has access to Drive API
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/about?fields=user",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error checking docs access:", error);
    return false;
  }
}

export function saveUserPermissions(permissions: UserPermissions): void {
  Cookies.set("user_permissions", JSON.stringify(permissions), {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function getUserPermissions(): UserPermissions | null {
  const permissionsStr = Cookies.get("user_permissions");
  if (!permissionsStr) return null;

  try {
    return JSON.parse(permissionsStr);
  } catch (error) {
    console.error("Error parsing user permissions:", error);
    return null;
  }
}
