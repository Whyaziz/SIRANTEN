"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load user info from cookies
    const storedUserInfo = Cookies.get("user_info");
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
  }, []);

  const logout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_info");
    Cookies.remove("token_expiry");
    router.push("/login");
  };

  // Function to get user initials
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Function to generate background color based on name
  const getProfileColor = (name: string) => {
    if (!name) return "bg-gray-500";
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with user info and logout */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                {userInfo?.picture && !imageError ? (
                  <>
                    <img
                      src={userInfo.picture}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </>
                ) : (
                  <>
                    <div
                      className={`w-12 h-12 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-lg ${getProfileColor(
                        userInfo?.name || "User"
                      )}`}
                    >
                      {getUserInitials(userInfo?.name || "User")}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </>
                )}
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-800">
                  Selamat datang, {userInfo?.name || "User"}!
                </h2>
                <p className="text-gray-600 text-sm">{userInfo?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Dashboard Siranten
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistem Informasi Persuratan Desa Ngabeyan - Buat surat dengan lebih
            mudah
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {/* Buat Surat Card */}
          <Link href="/surat/create" className="group">
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 h-full group-hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  Buat Surat
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Buat surat baru untuk keperluan administrasi desa dengan
                  template yang tersedia
                </p>
                <div className="flex items-center text-blue-500 group-hover:text-blue-700 font-semibold">
                  Mulai Membuat
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Data Penduduk Card */}
          <Link href="/penduduk" className="group">
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 h-full group-hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
                  Data Penduduk
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Akses dan kelola data penduduk desa dengan sistem yang
                  terintegrasi
                </p>
                <div className="flex items-center text-green-500 group-hover:text-green-700 font-semibold">
                  Lihat Data
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
