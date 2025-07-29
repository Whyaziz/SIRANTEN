"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchResidents, Resident } from "@/utils/spreadsheetService";

interface Filters {
  jenisKelamin: string;
  statusKawin: string;
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  rt: string;
  rw: string;
}

export default function PendudukPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    jenisKelamin: "",
    statusKawin: "",
    agama: "",
    pendidikan: "",
    pekerjaan: "",
    rt: "",
    rw: "",
  });
  const residentsPerPage = 10;

  // Get unique values for filter options
  const getUniqueValues = (field: keyof Resident) => {
    return [
      ...new Set(
        residents.map((r) => r[field]).filter((v) => v && v.trim() !== "")
      ),
    ].sort();
  };

  useEffect(() => {
    const getResidents = async () => {
      try {
        setLoading(true);
        const data = await fetchResidents();
        setResidents(data);
        setFilteredResidents(data);
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

  useEffect(() => {
    let filtered = residents;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (resident) =>
          resident.namaLengkap.toLowerCase().includes(query) ||
          resident.nik.includes(query) ||
          resident.noKK.includes(query) ||
          resident.alamat.toLowerCase().includes(query) ||
          resident.pekerjaan.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        filtered = filtered.filter(
          (resident) =>
            resident[key as keyof Resident].toLowerCase() ===
            value.toLowerCase()
        );
      }
    });

    setFilteredResidents(filtered);
    setCurrentPage(1);
  }, [searchQuery, filters, residents]);

  // Get current residents
  const indexOfLastResident = currentPage * residentsPerPage;
  const indexOfFirstResident = indexOfLastResident - residentsPerPage;
  const currentResidents = filteredResidents.slice(
    indexOfFirstResident,
    indexOfLastResident
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredResidents.length / residentsPerPage);

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const resetFilters = () => {
    setFilters({
      jenisKelamin: "",
      statusKawin: "",
      agama: "",
      pendidikan: "",
      pekerjaan: "",
      rt: "",
      rw: "",
    });
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-gray-600">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold">Data Penduduk</h1>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Dashboard
              </Link>
            </div>
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
              <p className="font-medium">Terjadi Kesalahan</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Login Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Data Penduduk
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Total {residents.length} penduduk
              </p>
            </div>
            <Link
              href="/"
              className="text-red-600 hover:text-red-700 text-sm flex items-center"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Cari nama, NIK, alamat..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pl-10 text-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
              Filter {showFilters ? "▲" : "▼"}
            </button>
            <span className="text-sm text-gray-500">
              {filteredResidents.length} dari {residents.length} data
            </span>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <select
                  value={filters.jenisKelamin}
                  onChange={(e) =>
                    setFilters({ ...filters, jenisKelamin: e.target.value })
                  }
                  className="p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Jenis Kelamin</option>
                  {getUniqueValues("jenisKelamin").map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.statusKawin}
                  onChange={(e) =>
                    setFilters({ ...filters, statusKawin: e.target.value })
                  }
                  className="p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Status Kawin</option>
                  {getUniqueValues("statusKawin").map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.agama}
                  onChange={(e) =>
                    setFilters({ ...filters, agama: e.target.value })
                  }
                  className="p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Agama</option>
                  {getUniqueValues("agama").map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.rt}
                  onChange={(e) =>
                    setFilters({ ...filters, rt: e.target.value })
                  }
                  className="p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">RT</option>
                  {getUniqueValues("rt").map((value) => (
                    <option key={value} value={value}>
                      RT {value}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="text-red-600 hover:text-red-700 text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    NIK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    JK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Umur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alamat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentResidents.length > 0 ? (
                  currentResidents.map((resident, index) => (
                    <tr
                      key={resident.nik || index}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {indexOfFirstResident + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {resident.namaLengkap}
                        </div>
                        <div className="text-xs text-gray-500">
                          {resident.pekerjaan}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {resident.nik}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {resident.jenisKelamin}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {resident.umur}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {resident.alamat}
                        </div>
                        <div className="text-xs text-gray-500">
                          RT {resident.rt} RW {resident.rw}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/penduduk/${resident.nik}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500 text-sm"
                    >
                      {searchQuery || Object.values(filters).some((f) => f)
                        ? "Tidak ada data yang sesuai"
                        : "Tidak ada data penduduk"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredResidents.length > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                {indexOfFirstResident + 1}-
                {Math.min(indexOfLastResident, filteredResidents.length)} dari{" "}
                {filteredResidents.length}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  ‹
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
