"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchResidents, Resident } from "@/utils/spreadsheetService";
import { letterTypes, LetterType } from "@/types/letterTypes";
import ResidentSearch from "@/components/ResidentSearch";
import LetterForm from "@/components/LetterForm";

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

export default function BuatSuratPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );
  const [selectedLetterType, setSelectedLetterType] = useState<string | null>(
    null
  );
  const [step, setStep] = useState<
    "select-letter" | "select-resident" | "fill-form"
  >("select-letter");
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch residents data
  useEffect(() => {
    const getResidents = async () => {
      try {
        setLoading(true);
        const data = await fetchResidents();
        setResidents(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching residents:", err);
        setError(
          "Gagal memuat data penduduk. Pastikan Anda sudah login dan memiliki akses yang sesuai."
        );
      } finally {
        setLoading(false);
      }
    };

    getResidents();
  }, []);

  const handleLetterTypeSelect = (typeId: string) => {
    setSelectedLetterType(typeId);
    setStep("select-resident");
  };

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    setFormData({
      letterType: selectedLetterType,
    });
    setStep("fill-form");
  };

  const handleBack = () => {
    if (step === "select-resident") {
      setStep("select-letter");
      setSelectedLetterType(null);
    } else if (step === "fill-form") {
      setStep("select-resident");
      setSelectedResident(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store the form data in localStorage for the preview page to access
      const letterData = {
        resident: selectedResident,
        letterType: selectedLetterType,
        formData,
      };

      localStorage.setItem("letterPreviewData", JSON.stringify(letterData));

      // Redirect to the preview page
      router.push("/surat/preview");
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Terjadi kesalahan saat membuat surat. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat data penduduk...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Buat Surat</h1>
            <Link href="/" className="text-blue-500 hover:underline">
              Kembali ke Dashboard
            </Link>
          </div>

          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
            <h3 className="font-semibold text-lg mb-1">Terjadi Kesalahan</h3>
            <p>{error}</p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Login Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-6 text-gray-800">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Buat Surat</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Step navigation */}
        <div className="flex mb-8">
          <div
            className={`flex-1 text-center p-2 border-b-2 ${
              step === "select-letter"
                ? "border-blue-500 text-blue-600"
                : "border-gray-200 text-gray-500"
            }`}
          >
            1. Pilih Jenis Surat
          </div>
          <div
            className={`flex-1 text-center p-2 border-b-2 ${
              step === "select-resident"
                ? "border-blue-500 text-blue-600"
                : "border-gray-200 text-gray-500"
            }`}
          >
            2. Pilih Penduduk
          </div>
          <div
            className={`flex-1 text-center p-2 border-b-2 ${
              step === "fill-form"
                ? "border-blue-500 text-blue-600"
                : "border-gray-200 text-gray-500"
            }`}
          >
            3. Isi Data Surat
          </div>
        </div>

        {/* Step content */}
        {step === "select-letter" && (
          <div>
            <p className="text-gray-600 mb-4">
              Silakan pilih jenis surat yang ingin dibuat:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {letterTypes.map((letterType) => (
                <div
                  key={letterType.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => handleLetterTypeSelect(letterType.id)}
                >
                  <h3 className="font-medium text-lg">{letterType.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {letterType.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "select-resident" && (
          <div>
            <div className="flex items-center mb-6">
              <button
                onClick={handleBack}
                className="text-blue-500 hover:underline mr-3 flex items-center"
              >
                <span className="mr-1">←</span> Kembali
              </button>
              <h2 className="text-xl font-semibold">
                Pilih Penduduk untuk{" "}
                {letterTypes.find((lt) => lt.id === selectedLetterType)?.title}
              </h2>
            </div>

            <ResidentSearch
              residents={residents}
              onSelect={handleResidentSelect}
            />
          </div>
        )}

        {step === "fill-form" && selectedResident && selectedLetterType && (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mb-6">
              <button
                type="button"
                onClick={handleBack}
                className="text-blue-500 hover:underline mr-3 flex items-center"
              >
                <span className="mr-1">←</span> Kembali
              </button>
              <h2 className="text-xl font-semibold">
                Isi Data{" "}
                {letterTypes.find((lt) => lt.id === selectedLetterType)?.title}
              </h2>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Data Penduduk</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Nama Lengkap:</p>
                    <p className="font-medium">
                      {selectedResident.namaLengkap}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">NIK:</p>
                    <p className="font-medium">{selectedResident.nik}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">No. KK:</p>
                    <p className="font-medium">{selectedResident.noKK}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jenis Kelamin:</p>
                    <p className="font-medium">
                      {getGenderDisplay(selectedResident.jenisKelamin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Tempat/Tanggal Lahir:
                    </p>
                    <p className="font-medium">
                      {selectedResident.tempatLahir},{" "}
                      {selectedResident.tglLahir}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status Perkawinan:</p>
                    <p className="font-medium">
                      {getMaritalStatusDisplay(selectedResident.statusKawin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pendidikan:</p>
                    <p className="font-medium">{selectedResident.pendidikan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Agama:</p>
                    <p className="font-medium">{selectedResident.agama}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pekerjaan:</p>
                    <p className="font-medium">{selectedResident.pekerjaan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Umur:</p>
                    <p className="font-medium">{selectedResident.umur} tahun</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alamat:</p>
                    <p className="font-medium">
                      {selectedResident.alamat} RT {selectedResident.rt} RW{" "}
                      {selectedResident.rw}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">RT/RW:</p>
                    <p className="font-medium">
                      {selectedResident.rt}/{selectedResident.rw}
                    </p>
                  </div>
                  {selectedResident.ayah && (
                    <div>
                      <p className="text-sm text-gray-600">Nama Ayah:</p>
                      <p className="font-medium">{selectedResident.ayah}</p>
                    </div>
                  )}
                  {selectedResident.ibu && (
                    <div>
                      <p className="text-sm text-gray-600">Nama Ibu:</p>
                      <p className="font-medium">{selectedResident.ibu}</p>
                    </div>
                  )}
                  {selectedResident.shdk && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Status Hub. dalam Keluarga:
                      </p>
                      <p className="font-medium">{selectedResident.shdk}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Data Surat</h3>
              <LetterForm
                letterType={selectedLetterType}
                letterTypeData={
                  letterTypes.find((lt) => lt.id === selectedLetterType)!
                }
                resident={selectedResident}
                formData={formData}
                setFormData={setFormData}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition-colors ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Memproses..." : "Buat Surat"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
