import { LetterType } from "@/types/letterTypes";
import Cookies from "js-cookie";

const SPREADSHEET_ID = "1qrVEdQFbbZBiB-L8ihMNhpq2s2sQLb-qoNoV6WcoSXw";
const SHEET_NAME = "template-surat";
const RANGE = "A2:F"; // Starting from A2 to skip header

export async function fetchLetterTypes(): Promise<LetterType[]> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error("ACCESS_DENIED");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch letter types: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      return [];
    }

    // Transform spreadsheet data to LetterType objects
    const letterTypes: LetterType[] = data.values.map((row: string[]) => {
      const [id, title, description, letterCode, docId, variablesStr] = row;

      // Parse variables string (comma-separated) into array
      const variables = variablesStr
        ? variablesStr.split(",").map((v) => v.trim())
        : [];

      return {
        id: id || "",
        title: title || "",
        description: description || "",
        letterCode: letterCode || "",
        docId: docId || "",
        variables,
      };
    });

    return letterTypes;
  } catch (error) {
    console.error("Error fetching letter types:", error);
    throw new Error("Gagal memuat jenis surat dari database");
  }
}

// Function to add a new letter type (optional)
export async function addLetterType(letterType: LetterType): Promise<boolean> {
  try {
    const variablesStr = letterType.variables.join(", ");
    const values = [
      [
        letterType.id,
        letterType.title,
        letterType.description,
        letterType.letterCode,
        letterType.docId,
        variablesStr,
      ],
    ];

    const response = await fetch("/api/sheets/append", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:F`,
        values,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error adding letter type:", error);
    return false;
  }
}
