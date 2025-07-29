"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchResidents, Resident } from "@/utils/spreadsheetService";

export default function DetailPendudukPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);
  const params = useParams();
  const nik = params.nik as string;

  useEffect(() => {
    const getResident = async () => {
      try {
        setLoading(true);
        const residents = await fetchResidents();
        const foundResident = residents.find((r) => r.nik === nik);

        if (foundResident) {
          setResident(foundResident);
        } else {
          setError("Data penduduk tidak ditemukan");
        }
      } catch (err) {
        console.error("Error fetching resident:", err);
        setError("Gagal memuat data penduduk");
      } finally {
        setLoading(false);
      }
    };

    if (nik) {
      getResident();
    }
  }, [nik]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail penduduk...</p>
        </div>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Data Tidak Ditemukan
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/penduduk"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Kembali ke Data Penduduk
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Detail Penduduk
              </h1>
              <p className="text-gray-600">Informasi lengkap data penduduk</p>
            </div>
            <Link
              href="/penduduk"
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Kembali
            </Link>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Informasi Pribadi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nama Lengkap
                </label>
                <p className="text-lg font-semibold text-gray-800">
                  {resident.namaLengkap}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">NIK</label>
                <p className="text-lg text-gray-800">{resident.nik}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  No. KK
                </label>
                <p className="text-lg text-gray-800">{resident.noKK}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Jenis Kelamin
                </label>
                <p className="text-lg text-gray-800">{resident.jenisKelamin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Umur
                </label>
                <p className="text-lg text-gray-800">{resident.umur} tahun</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tempat, Tanggal Lahir
                </label>
                <p className="text-lg text-gray-800">
                  {resident.tempatLahir}, {resident.tglLahir}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status Kawin
                </label>
                <p className="text-lg text-gray-800">{resident.statusKawin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Agama
                </label>
                <p className="text-lg text-gray-800">{resident.agama}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Pendidikan
                </label>
                <p className="text-lg text-gray-800">{resident.pendidikan}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Pekerjaan
                </label>
                <p className="text-lg text-gray-800">{resident.pekerjaan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Informasi Alamat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Alamat
              </label>
              <p className="text-lg text-gray-800">{resident.alamat}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">RT</label>
              <p className="text-lg text-gray-800">{resident.rt}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">RW</label>
              <p className="text-lg text-gray-800">{resident.rw}</p>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Informasi Keluarga
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Nama Ayah
              </label>
              <p className="text-lg text-gray-800">{resident.ayah || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Nama Ibu
              </label>
              <p className="text-lg text-gray-800">{resident.ibu || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status Hubungan
              </label>
              <p className="text-lg text-gray-800">{resident.shdk || "-"}</p>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Status Data
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Pindah
              </label>
              <p className="text-lg text-gray-800">{resident.pindah || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Datang
              </label>
              <p className="text-lg text-gray-800">{resident.datang || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lahir</label>
              <p className="text-lg text-gray-800">{resident.lahir || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Meninggal
              </label>
              <p className="text-lg text-gray-800">{resident.mati || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
