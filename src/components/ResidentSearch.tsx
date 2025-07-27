import { useState, useEffect } from "react";
import { Resident } from "@/utils/spreadsheetService";

interface ResidentSearchProps {
  residents: Resident[];
  onSelect: (resident: Resident) => void;
  selectedResident?: Resident;
}

export default function ResidentSearch({
  residents,
  onSelect,
  selectedResident,
}: ResidentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResidents([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = residents
      .filter(
        (resident) =>
          resident.namaLengkap.toLowerCase().includes(query) ||
          resident.nik.includes(query) ||
          resident.noKK.includes(query)
      )
      .slice(0, 10); // Limit results to 10 for performance

    setFilteredResidents(filtered);
  }, [searchQuery, residents]);

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, NIK, atau No. KK..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {filteredResidents.length > 0 && searchQuery.trim() !== "" && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredResidents.map((resident) => (
              <div
                key={resident.nik}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                onClick={() => {
                  onSelect(resident);
                  setSearchQuery("");
                }}
              >
                <div className="font-medium">{resident.namaLengkap}</div>
                <div className="text-sm text-gray-600">NIK: {resident.nik}</div>
                <div className="text-sm text-gray-600">
                  Alamat: {resident.alamat} RT {resident.rt} RW {resident.rw}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedResident && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-lg mb-1">Data Penduduk Terpilih:</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-sm text-gray-600">Nama Lengkap:</p>
              <p className="font-medium">{selectedResident.namaLengkap}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">NIK:</p>
              <p className="font-medium">{selectedResident.nik}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tempat/Tanggal Lahir:</p>
              <p className="font-medium">
                {selectedResident.tempatLahir}, {selectedResident.tglLahir}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jenis Kelamin:</p>
              <p className="font-medium">{selectedResident.jenisKelamin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Alamat:</p>
              <p className="font-medium">
                {selectedResident.alamat} RT {selectedResident.rt} RW{" "}
                {selectedResident.rw}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pekerjaan:</p>
              <p className="font-medium">{selectedResident.pekerjaan}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
