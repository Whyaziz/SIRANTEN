import Cookies from "js-cookie";

export interface Resident {
  no: string;
  nik: string;
  noKK: string;
  namaLengkap: string;
  alamat: string;
  rt: string;
  rw: string;
  tempatLahir: string;
  tglLahir: string;
  jenisKelamin: string;
  statusKawin: string;
  pendidikan: string;
  agama: string;
  pekerjaan: string;
  umur: string;
  rtrw: string;
  statusData: string;
  pindah: string;
  datang: string;
  lahir: string;
  mati: string;
  statusData2: string;
  ayah: string;
  ibu: string;
  shdk: string;
}

const SPREADSHEET_ID = "16ttH7gPVg9KBK3f8NGWWNiY1QkjPGHhU-5n2-wlKqWg";
const RANGE = "Daftar Penduduk!A1:Y4000";
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;

export async function fetchResidents(): Promise<Resident[]> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 403) {
      throw new Error("ACCESS_DENIED");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length < 2) {
      return [];
    }

    // Skip the header row (index 0) and map the data rows to Resident objects
    return rows.slice(1).map((row: any) => {
      return {
        no: row[0] || "",
        nik: row[1] || "",
        noKK: row[2] || "",
        namaLengkap: row[3] || "",
        alamat: row[4] || "",
        rt: row[5] || "",
        rw: row[6] || "",
        tempatLahir: row[7] || "",
        tglLahir: row[8] || "",
        jenisKelamin: row[9] || "",
        statusKawin: row[10] || "",
        pendidikan: row[11] || "",
        agama: row[12] || "",
        pekerjaan: row[13] || "",
        umur: row[14] || "",
        rtrw: row[15] || "",
        statusData: row[16] || "",
        pindah: row[17] || "",
        datang: row[18] || "",
        lahir: row[19] || "",
        mati: row[20] || "",
        statusData2: row[21] || "",
        ayah: row[22] || "",
        ibu: row[23] || "",
        shdk: row[24] || "",
      };
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

// Add function to check spreadsheet access
export async function checkSpreadsheetAccess(): Promise<boolean> {
  const accessToken = Cookies.get("auth_token");

  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error checking spreadsheet access:", error);
    return false;
  }
}
