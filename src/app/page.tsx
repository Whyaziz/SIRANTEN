"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg mb-8">Welcome to your dashboard!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Navigation Card for Buat Surat */}
        <Link href="/surat/create" className="group">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 h-full">
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              Buat Surat
            </h2>
            <p className="text-gray-600">
              Buat surat baru untuk keperluan administrasi desa
            </p>
            <div className="mt-4 text-blue-500 group-hover:text-blue-700">
              Mulai →
            </div>
          </div>
        </Link>

        {/* Navigation Card for Lihat Data Penduduk */}
        <Link href="/penduduk" className="group">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 h-full">
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              Lihat Data Penduduk
            </h2>
            <p className="text-gray-600">Akses dan kelola data penduduk desa</p>
            <div className="mt-4 text-blue-500 group-hover:text-blue-700">
              Lihat →
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/settings" className="text-blue-500 hover:underline">
          Go to Settings
        </Link>
      </div>
    </div>
  );
}
