import React from "react";
import { Resident } from "@/utils/spreadsheetService";
import { LetterType, LetterData } from "@/types/letterTypes";

interface LetterFormProps {
  letterType: LetterType;
  resident: Resident;
  formData: any;
  setFormData: (data: any) => void;
}

export default function LetterForm({
  letterType,
  resident,
  formData,
  setFormData,
}: LetterFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Common fields for all forms
  const renderCommonFields = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          No. Telp / Handphone
        </label>
        <input
          type="text"
          name="noTelp"
          value={formData.noTelp || ""}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Masukkan nomor telepon"
        />
      </div>
    </>
  );

  const renderKeteranganTambahan = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Keterangan Tambahan
      </label>
      <textarea
        name="keteranganTambahan"
        value={formData.keteranganTambahan || ""}
        onChange={handleChange}
        rows={4}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Masukkan keterangan tambahan jika ada"
      />
    </div>
  );

  // Render form based on letter type
  switch (letterType) {
    case "USULAN_PESERTA":
      return (
        <div className="space-y-4">
          {renderCommonFields()}
          {renderKeteranganTambahan()}
        </div>
      );

    case "TIDAK_MAMPU":
      return (
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kewarganegaraan
            </label>
            <input
              type="text"
              name="kewarganegaraan"
              value={formData.kewarganegaraan || "Indonesia"}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {renderCommonFields()}
          {renderKeteranganTambahan()}
        </div>
      );

    case "JALUR_AFIRMASI":
      return (
        <div className="space-y-4">
          {renderCommonFields()}

          <h3 className="text-lg font-medium border-b pb-1 mb-3">Data Anak</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Anak
            </label>
            <input
              type="text"
              name="namaAnak"
              value={formData.namaAnak || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Sekolah
            </label>
            <input
              type="text"
              name="namaSekolah"
              value={formData.namaSekolah || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID JTG
            </label>
            <input
              type="text"
              name="idjtg"
              value={formData.idjtg || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir Anak
              </label>
              <input
                type="text"
                name="tempatLahirAnak"
                value={formData.tempatLahirAnak || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir Anak
              </label>
              <input
                type="date"
                name="tanggalLahirAnak"
                value={formData.tanggalLahirAnak || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIK Anak
            </label>
            <input
              type="text"
              name="nikAnak"
              value={formData.nikAnak || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Anak
            </label>
            <input
              type="text"
              name="alamatAnak"
              value={formData.alamatAnak || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {renderKeteranganTambahan()}
        </div>
      );

    case "KEHILANGAN_KK":
      return (
        <div className="space-y-4">
          {renderCommonFields()}
          {renderKeteranganTambahan()}
        </div>
      );

    case "PENGANTAR":
      return (
        <div className="space-y-4">
          {renderCommonFields()}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan Lain
            </label>
            <input
              type="text"
              name="keteranganLain"
              value={formData.keteranganLain || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pesan Surat
            </label>
            <textarea
              name="pesanSurat"
              value={formData.pesanSurat || ""}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Masukkan pesan surat"
            />
          </div>

          {renderKeteranganTambahan()}
        </div>
      );

    case "DOMISILI":
      return (
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bin/Binti
            </label>
            <input
              type="text"
              name="binBinti"
              value={formData.binBinti || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kewarganegaraan
            </label>
            <input
              type="text"
              name="kewarganegaraan"
              value={formData.kewarganegaraan || "Indonesia"}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Sesuai KTP
            </label>
            <textarea
              name="alamatKTP"
              value={
                formData.alamatKTP ||
                `${resident.alamat} RT ${resident.rt} RW ${resident.rw}`
              }
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Domisili
            </label>
            <textarea
              name="alamatDomisili"
              value={formData.alamatDomisili || ""}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lama Tinggal
            </label>
            <input
              type="text"
              name="lamaTinggal"
              value={formData.lamaTinggal || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Contoh: 5 tahun"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keperluan
            </label>
            <textarea
              name="keperluan"
              value={formData.keperluan || ""}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Masukkan keperluan surat keterangan ini"
            />
          </div>

          {renderCommonFields()}
          {renderKeteranganTambahan()}
        </div>
      );

    case "USAHA":
      return (
        <div className="space-y-4">
          {renderCommonFields()}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keperluan
            </label>
            <textarea
              name="keperluan"
              value={formData.keperluan || ""}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Masukkan keperluan surat keterangan ini"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masa Berlaku
            </label>
            <input
              type="text"
              name="masaBerlaku"
              value={formData.masaBerlaku || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Contoh: 6 bulan"
            />
          </div>

          {renderKeteranganTambahan()}
        </div>
      );

    default:
      return (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
          Form untuk jenis surat ini belum tersedia.
        </div>
      );
  }
}
