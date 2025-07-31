"use client";
import { useEffect, useState } from "react";
import { getUserPermissions, UserPermissions } from "@/utils/permissionService";

interface PermissionGuardProps {
  children: React.ReactNode;
  requireSpreadsheet?: boolean;
  requireDocs?: boolean;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({
  children,
  requireSpreadsheet = false,
  requireDocs = false,
  fallback,
}: PermissionGuardProps) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userPermissions = getUserPermissions();
    setPermissions(userPermissions);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!permissions) {
    return (
      fallback || (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Tidak dapat memuat informasi izin pengguna.</p>
        </div>
      )
    );
  }

  const hasRequiredPermissions =
    (!requireSpreadsheet || permissions.hasSpreadsheetAccess) &&
    (!requireDocs || permissions.hasDocsAccess);

  if (!hasRequiredPermissions) {
    return (
      fallback || (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h3 className="font-semibold mb-2">Akses Terbatas</h3>
          <p className="text-sm">
            {requireSpreadsheet &&
              !permissions.hasSpreadsheetAccess &&
              "Anda tidak memiliki akses ke data spreadsheet. "}
            {requireDocs &&
              !permissions.hasDocsAccess &&
              "Anda tidak memiliki akses ke dokumen template. "}
            Silakan hubungi administrator untuk mendapatkan akses.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
