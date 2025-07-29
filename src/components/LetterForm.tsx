"use client";

import { useState, useEffect } from "react";
import { Resident } from "@/utils/spreadsheetService";
import { LetterType } from "@/types/letterTypes";

interface LetterFormProps {
  letterType: string;
  letterTypeData: LetterType;
  resident: Resident;
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

// Helper function to convert gender code to display text
const getGenderDisplay = (gender: string): string => {
  switch (gender?.toUpperCase()) {
    case "LK":
      return "Laki-laki";
    case "PR":
      return "Perempuan";
    default:
      return gender || "";
  }
};

// Helper function to determine bin/binti based on gender
const getBinBinti = (gender: string, ayah: string): string => {
  const genderCode = gender?.toUpperCase();
  if (genderCode === "LK") {
    return `bin ${ayah || ""}`;
  } else if (genderCode === "PR") {
    return `binti ${ayah || ""}`;
  }
  return `bin ${ayah || ""}`;
};

// Helper function to convert marital status
const getMaritalStatusDisplay = (status: string): string => {
  switch (status?.toUpperCase()) {
    case "JD":
      return "Janda";
    case "DD":
      return "Duda";
    case "K":
      return "Kawin";
    case "BK":
      return "Belum Kawin";
    default:
      return status || "";
  }
};

// Helper function to convert month to Roman numerals
const getMonthInRoman = (month: number): string => {
  const romanNumerals = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  return romanNumerals[month - 1] || "I";
};

export default function LetterForm({
  letterType,
  letterTypeData,
  resident,
  formData,
  setFormData,
}: LetterFormProps) {
  // Generate letter number
  const generateLetterNumber = (letterTypeData: LetterType) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 999) + 1;
    const letterCode = letterTypeData.letterCode || "KET-UMU";
    const romanMonth = getMonthInRoman(month);

    return `${String(random).padStart(
      3,
      "0"
    )}/${letterCode}/${romanMonth}/${year}`;
  };

  // Auto-populate form data
  useEffect(() => {
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const autoData: Record<string, string> = {
      // Generated data
      nomor_surat: generateLetterNumber(letterTypeData),
      date: dateStr,
      tanggal: dateStr, // Add this for fields that might use 'tanggal' instead of 'date'

      // Resident data mappings with gender conversion
      nama: resident.namaLengkap || "",
      nik: resident.nik || "",
      nokk: resident.noKK || "",
      "jenis-kelamin": getGenderDisplay(resident.jenisKelamin),
      "tempat-tanggal-lahir": `${resident.tempatLahir || ""}, ${
        resident.tglLahir || ""
      }`
        .trim()
        .replace(/^,\s*/, "")
        .replace(/,\s*$/, ""), // Clean up empty values
      "tempat-lahir": resident.tempatLahir || "",
      "tanggal-lahir": resident.tglLahir || "",
      alamat: `${resident.alamat || ""} RT ${resident.rt || ""} RW ${
        resident.rw || ""
      }`,
      "alamat-lengkap": `${resident.alamat || ""} RT ${resident.rt || ""} RW ${
        resident.rw || ""
      }`,
      "alamat-domisili": `${resident.alamat || ""} RT ${resident.rt || ""} RW ${
        resident.rw || ""
      }`,
      rt: resident.rt || "",
      rw: resident.rw || "",
      rtrw: `${resident.rt || ""}/${resident.rw || ""}`,
      agama: resident.agama || "",
      pekerjaan: resident.pekerjaan || "",
      "status-kawin": getMaritalStatusDisplay(resident.statusKawin),
      "status-perkawinan": getMaritalStatusDisplay(resident.statusKawin),
      pendidikan: resident.pendidikan || "",
      umur: resident.umur || "",
      ayah: resident.ayah || "",
      ibu: resident.ibu || "",
      "nama-ayah": resident.ayah || "",
      "nama-ibu": resident.ibu || "",
      shdk: resident.shdk || "",
      "status-hubungan": resident.shdk || "",
      kewarganegaraan: "Indonesia",
      pemohon: resident.namaLengkap || "",
      bin: getBinBinti(resident.jenisKelamin, resident.ayah),

      // Default administrative data for Ngabeyan village
      "kepala-desa": "SUPRIYADI",
      camat: "Joko Hanoyo HS, S.STP, M.Si",
      "nip-camat": "197806171998021002",
      desa: "Ngabeyan",
      kecamatan: "Karanganom",
      kabupaten: "Klaten",
      provinsi: "Jawa Tengah",
    };

    setFormData((prev) => ({ ...prev, ...autoData }));
  }, [resident, setFormData, letterTypeData]);

  const handleInputChange = (variable: string, value: string) => {
    setFormData((prev) => ({ ...prev, [variable]: value }));
  };

  const getFieldLabel = (variable: string): string => {
    const labels: Record<string, string> = {
      nomor_surat: "Nomor Surat",
      nama: "Nama Lengkap",
      "tempat-tanggal-lahir": "Tempat, Tanggal Lahir",
      "tempat-lahir": "Tempat Lahir",
      "tanggal-lahir": "Tanggal Lahir",
      kewarganegaraan: "Kewarganegaraan",
      pekerjaan: "Pekerjaan",
      nokk: "No. Kartu Keluarga",
      nik: "NIK",
      "jenis-kelamin": "Jenis Kelamin",
      alamat: "Alamat",
      "alamat-lengkap": "Alamat Lengkap",
      "alamat-domisili": "Alamat Domisili",
      "status-kawin": "Status Perkawinan",
      "status-perkawinan": "Status Perkawinan",
      pendidikan: "Pendidikan",
      umur: "Umur",
      ayah: "Nama Ayah",
      ibu: "Nama Ibu",
      "nama-ayah": "Nama Ayah",
      "nama-ibu": "Nama Ibu",
      shdk: "Status Hubungan dalam Keluarga",
      "status-hubungan": "Status Hubungan dalam Keluarga",
      rtrw: "RT/RW",
      keperluan: "Keperluan",
      "masa-berlaku": "Masa Berlaku",
      rw: "RW",
      rt: "RT",
      "nomor-tanggal-surat": "Nomor & Tanggal Surat RW",
      "tanggal-nomor-surat": "Tanggal & Nomor Surat RW",
      "bidang-usaha": "Bidang Usaha",
      "lokasi-usaha": "Lokasi Usaha",
      "lama-usaha": "Lama Usaha (tahun)",
      "surat-diperlukan": "Surat Diperlukan Untuk",
      pemohon: "Nama Pemohon",
      date: "Tanggal",
      "kepala-desa": "Nama Kepala Desa",
      "keterangan-lain": "Keterangan Lain",
      "barang-hilang": "Barang yang Hilang",
      "hilang-oleh": "Barang Hilang Oleh",
      "lokasi-hilang": "Lokasi Kehilangan",
      bin: "Bin/Binti",
      dukuh: "Dukuh/Dusun",
      "lama-tinggal": "Lama Tinggal",
      camat: "Nama Camat",
      "nip-camat": "NIP Camat",
      agama: "Agama",
      "nama-sekolah": "Nama Sekolah",
      "nama-anak": "Nama Anak",
      idjtg: "ID JTG/Nomor Identitas",
      "tempat-tanggal-lahir-anak": "Tempat, Tanggal Lahir Anak",
      "nik-anak": "NIK Anak",
      "alamat-anak": "Alamat Anak",
      notlp: "No. Telepon",
      desa: "Desa",
      kecamatan: "Kecamatan",
      kabupaten: "Kabupaten",
      provinsi: "Provinsi",
    };
    return (
      labels[variable] ||
      variable.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const isReadOnlyField = (variable: string): boolean => {
    const readOnlyFields = [
      "nomor_surat",
      "date",
      "tanggal",
      "nama",
      "nik",
      "nokk",
      "jenis-kelamin",
      "tempat-tanggal-lahir",
      "tempat-lahir",
      "tanggal-lahir",
      "alamat",
      "alamat-lengkap",
      "alamat-domisili",
      "rt",
      "rw",
      "rtrw",
      "agama",
      "pekerjaan",
      "status-kawin",
      "status-perkawinan",
      "pendidikan",
      "umur",
      "ayah",
      "ibu",
      "nama-ayah",
      "nama-ibu",
      "shdk",
      "status-hubungan",
      "pemohon",
      "desa",
      "kecamatan",
      "kabupaten",
      "provinsi",
    ];
    return readOnlyFields.includes(variable);
  };

  const getFieldType = (variable: string): string => {
    // Don't use date input type for auto-filled date fields to show formatted text
    // Also exclude tempat-tanggal-lahir-anak to keep it as text input
    if (
      (variable.includes("tanggal") || variable === "date") &&
      !isReadOnlyField(variable) &&
      variable !== "tempat-tanggal-lahir-anak"
    ) {
      return "date";
    }
    if (variable.includes("telp") || variable.includes("phone")) return "tel";
    if (variable.includes("email")) return "email";
    return "text";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {letterTypeData.variables.map((variable) => (
          <div key={variable} className="space-y-2">
            <label
              htmlFor={variable}
              className="block text-sm font-medium text-gray-700"
            >
              {getFieldLabel(variable)}
              {isReadOnlyField(variable) && (
                <span className="text-xs text-gray-500 ml-1">(otomatis)</span>
              )}
            </label>

            {variable === "keperluan" ||
            variable === "keterangan-lain" ||
            variable === "surat-diperlukan" ? (
              <textarea
                id={variable}
                name={variable}
                rows={3}
                value={formData[variable] || ""}
                onChange={(e) => handleInputChange(variable, e.target.value)}
                readOnly={isReadOnlyField(variable)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isReadOnlyField(variable) ? "bg-gray-100 text-gray-600" : ""
                }`}
                placeholder={`Masukkan ${getFieldLabel(
                  variable
                ).toLowerCase()}`}
              />
            ) : variable === "nomor-tanggal-surat" ||
              variable === "tanggal-nomor-surat" ? (
              <input
                type="text"
                id={variable}
                name={variable}
                value={formData[variable] || ""}
                onChange={(e) => handleInputChange(variable, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  variable === "nomor-tanggal-surat"
                    ? "Contoh: 001/RW-01/III/2024, 15 Maret 2024"
                    : "Contoh: 15 Maret 2024, 001/RW-01/III/2024"
                }
              />
            ) : variable === "jenis-kelamin" ? (
              <select
                id={variable}
                name={variable}
                value={formData[variable] || ""}
                onChange={(e) => handleInputChange(variable, e.target.value)}
                disabled={isReadOnlyField(variable)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isReadOnlyField(variable) ? "bg-gray-100 text-gray-600" : ""
                }`}
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            ) : variable === "status-kawin" ||
              variable === "status-perkawinan" ? (
              <select
                id={variable}
                name={variable}
                value={formData[variable] || ""}
                onChange={(e) => handleInputChange(variable, e.target.value)}
                disabled={isReadOnlyField(variable)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isReadOnlyField(variable) ? "bg-gray-100 text-gray-600" : ""
                }`}
              >
                <option value="">Pilih Status Perkawinan</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Janda">Janda</option>
                <option value="Duda">Duda</option>
              </select>
            ) : (
              <input
                type={getFieldType(variable)}
                id={variable}
                name={variable}
                value={formData[variable] || ""}
                onChange={(e) => handleInputChange(variable, e.target.value)}
                readOnly={isReadOnlyField(variable)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isReadOnlyField(variable) ? "bg-gray-100 text-gray-600" : ""
                }`}
                placeholder={
                  variable === "masa-berlaku"
                    ? "Contoh: 15 Januari 2024 - 15 Januari 2025"
                    : isReadOnlyField(variable)
                    ? "Terisi otomatis"
                    : `Masukkan ${getFieldLabel(variable).toLowerCase()}`
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
