"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchDocumentTemplate,
  downloadDocument,
  replaceVariablesInTemplate,
  DocumentTemplate,
  createProcessedDocument,
  downloadProcessedDocument,
  deleteProcessedDocument,
  ProcessedDocument,
} from "@/utils/docsService";
import { fetchLetterTypes } from "@/utils/letterTypesService";
import { LetterType, fallbackLetterTypes } from "@/types/letterTypes";
import { Resident } from "@/utils/spreadsheetService";

interface PreviewData {
  resident: Resident;
  letterType: string;
  formData: any;
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

export default function PreviewPage() {
  const router = useRouter();
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [processedDocument, setProcessedDocument] =
    useState<ProcessedDocument | null>(null);
  const [letterTypes, setLetterTypes] = useState<LetterType[]>([]);

  // Fetch letter types
  useEffect(() => {
    const getLetterTypes = async () => {
      try {
        const types = await fetchLetterTypes();
        setLetterTypes(types);
      } catch (err) {
        console.warn("Failed to fetch letter types, using fallback:", err);
        setLetterTypes(fallbackLetterTypes);
      }
    };

    getLetterTypes();
  }, []);

  useEffect(() => {
    const loadPreviewData = () => {
      try {
        const storedData = localStorage.getItem("letterPreviewData");
        if (!storedData) {
          router.push("/surat/create");
          return;
        }

        const data = JSON.parse(storedData);
        setPreviewData(data);
      } catch (err) {
        console.error("Error loading preview data:", err);
        router.push("/surat/create");
      }
    };

    loadPreviewData();
  }, [router]);

  useEffect(() => {
    if (!previewData || letterTypes.length === 0) return;

    const loadTemplate = async () => {
      try {
        setLoading(true);

        // Get the letter type data to get the correct docId
        const letterTypeData = letterTypes.find(
          (lt) => lt.id === previewData.letterType
        );

        if (!letterTypeData) {
          throw new Error("Letter type not found");
        }

        // Pass the specific docId for this letter type
        const templateData = await fetchDocumentTemplate(letterTypeData.docId);
        setTemplate(templateData);

        // Create variables object from form data and resident data
        const variables = createVariablesFromData(previewData);

        // Replace variables in template
        const processed = replaceVariablesInTemplate(
          templateData.htmlContent,
          variables
        );
        setProcessedContent(processed);
      } catch (err) {
        console.error("Error loading template:", err);
        setError("Gagal memuat template surat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [previewData, letterTypes]);

  const createVariablesFromData = (
    data: PreviewData
  ): Record<string, string> => {
    const { resident, formData } = data;

    // Get current date
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Base variables from form data (includes generated and user input)
    const variables: Record<string, string> = {
      ...formData,

      // Ensure date is current
      date: dateStr,
      tanggalSurat: dateStr,
      tanggal: currentDate.getDate().toString(),
      bulan: currentDate.toLocaleDateString("id-ID", { month: "long" }),
      tahun: currentDate.getFullYear().toString(),

      // Comprehensive resident data mapping with proper conversions
      nama: resident.namaLengkap || "",
      nik: resident.nik || "",
      noKK: resident.noKK || "",
      nokk: resident.noKK || "",
      tempatLahir: resident.tempatLahir || "",
      tanggalLahir: resident.tglLahir || "",
      jenisKelamin: getGenderDisplay(resident.jenisKelamin),
      statusKawin: getMaritalStatusDisplay(resident.statusKawin),
      statusPerkawinan: getMaritalStatusDisplay(resident.statusKawin),
      pendidikan: resident.pendidikan || "",
      agama: resident.agama || "",
      pekerjaan: resident.pekerjaan || "",
      alamat: resident.alamat || "",
      alamatLengkap: `${resident.alamat || ""} RT ${resident.rt || ""} RW ${
        resident.rw || ""
      }`,
      rt: resident.rt || "",
      rw: resident.rw || "",
      rtrw: `${resident.rt || ""}/${resident.rw || ""}`,
      umur: resident.umur || "",
      ayah: resident.ayah || "",
      ibu: resident.ibu || "",
      namaAyah: resident.ayah || "",
      namaIbu: resident.ibu || "",
      shdk: resident.shdk || "",
      statusHubungan: resident.shdk || "",

      // Additional mappings for backward compatibility
      "tempat-lahir": resident.tempatLahir || "",
      "tanggal-lahir": resident.tglLahir || "",
      "jenis-kelamin": getGenderDisplay(resident.jenisKelamin),
      "status-kawin": getMaritalStatusDisplay(resident.statusKawin),
      "status-perkawinan": getMaritalStatusDisplay(resident.statusKawin),
      "nama-ayah": resident.ayah || "",
      "nama-ibu": resident.ibu || "",
      "status-hubungan": resident.shdk || "",
    };

    return variables;
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    try {
      setDownloading(format);
      setError(null); // Clear previous errors

      const letterTypeData = letterTypes.find(
        (lt) => lt.id === previewData?.letterType
      );
      const fileName = `${letterTypeData?.title.replace(
        /\s+/g,
        "_"
      )}_${previewData?.resident.namaLengkap.replace(/\s+/g, "_")}`;

      // Create variables object
      const variables = createVariablesFromData(previewData!);

      // Check if we already have a processed document
      let docToDownload = processedDocument;

      if (!docToDownload) {
        try {
          // Create a new processed document with variables replaced, passing the correct template docId
          docToDownload = await createProcessedDocument(
            variables,
            fileName,
            letterTypeData?.docId
          );
          setProcessedDocument(docToDownload);
        } catch (createError: any) {
          if (createError.message.includes("ACCESS_DENIED")) {
            setError(
              `Akses ditolak: Pastikan template dokumen ${letterTypeData?.title} memiliki izin yang tepat. Hubungi administrator untuk mengatur permission dokumen.`
            );
          } else {
            setError(`Gagal membuat dokumen: ${createError.message}`);
          }
          return;
        }
      }

      // Download the processed document
      await downloadProcessedDocument(
        docToDownload.documentId,
        format,
        fileName
      );
    } catch (err: any) {
      console.error("Error downloading:", err);
      if (err.message.includes("ACCESS_DENIED")) {
        setError(
          `Akses ditolak: Tidak dapat mengunduh ${format.toUpperCase()}. Pastikan Anda memiliki permission yang tepat pada dokumen.`
        );
      } else {
        setError(`Gagal mengunduh ${format.toUpperCase()}: ${err.message}`);
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleEdit = () => {
    router.push("/surat/create");
  };

  const handleCreateNew = () => {
    // Clean up processed document if exists
    if (processedDocument) {
      deleteProcessedDocument(processedDocument.documentId).catch(
        console.error
      );
    }
    localStorage.removeItem("letterPreviewData");
    router.push("/surat/create");
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (processedDocument) {
        deleteProcessedDocument(processedDocument.documentId).catch(
          console.error
        );
      }
    };
  }, [processedDocument]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">
            Memuat preview surat...
          </p>
        </div>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-center">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p className="mb-4">{error || "Data tidak ditemukan"}</p>
            <Link
              href="/surat/create"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Kembali ke Buat Surat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const letterTypeData = letterTypes.find(
    (lt) => lt.id === previewData.letterType
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-500 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Preview Surat</h1>
                <p className="text-blue-100">
                  {letterTypeData?.title} - {previewData.resident.namaLengkap}
                </p>
              </div>
              <div className="flex gap-2">
                {/* <button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition duration-200"
                >
                  Edit
                </button> */}
                <Link
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition duration-200"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Aksi Surat
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={downloading === "pdf"}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-2 rounded transition duration-200 flex items-center gap-2"
                >
                  {downloading === "pdf" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Memproses & Mengunduh...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Unduh PDF
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownload("docx")}
                  disabled={downloading === "docx"}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded transition duration-200 flex items-center gap-2"
                >
                  {downloading === "docx" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Memproses & Mengunduh...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Unduh DOCX
                    </>
                  )}
                </button>

                <button
                  onClick={handleCreateNew}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition duration-200"
                >
                  Buat Surat Baru
                </button>
              </div>
            </div>

            {/* Enhanced error display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Preview */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Preview Dokumen
            </h2>

            {/* Document Paper Style */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
              <div
                className="bg-white mx-auto"
                style={{ maxWidth: "8.5in", minHeight: "11in" }}
              >
                <div
                  className="p-8 text-black leading-relaxed"
                  style={{
                    fontFamily: 'Times, "Times New Roman", serif',
                    fontSize: "12pt",
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      processedContent || "<p>Tidak ada konten tersedia</p>",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Summary Information */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Informasi Surat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Jenis Surat:</p>
                <p className="font-medium">{letterTypeData?.title}</p>
              </div>
              <div>
                <p className="text-gray-600">Nama Pemohon:</p>
                <p className="font-medium">
                  {previewData.resident.namaLengkap}
                </p>
              </div>
              <div>
                <p className="text-gray-600">NIK:</p>
                <p className="font-medium">{previewData.resident.nik}</p>
              </div>
              <div>
                <p className="text-gray-600">Tanggal Dibuat:</p>
                <p className="font-medium">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for document styling */}
      <style jsx>{`
        .document-content h1,
        .document-content h2,
        .document-content h3,
        .document-content h4,
        .document-content h5,
        .document-content h6 {
          font-weight: bold;
          margin-bottom: 0.5em;
          margin-top: 1em;
        }

        .document-content h1 {
          font-size: 18pt;
        }
        .document-content h2 {
          font-size: 16pt;
        }
        .document-content h3 {
          font-size: 14pt;
        }

        .document-content table {
          border-collapse: collapse;
          margin: 1em 0;
          width: 100%;
        }

        .document-content table td,
        .document-content table th {
          border: 1px solid #ccc;
          padding: 8px;
          vertical-align: top;
        }

        .document-content p {
          margin-bottom: 1em;
          text-align: justify;
        }

        .document-content ul,
        .document-content ol {
          margin: 1em 0;
          padding-left: 2em;
        }

        .document-content li {
          margin-bottom: 0.5em;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .document-content {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
