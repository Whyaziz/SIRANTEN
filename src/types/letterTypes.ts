export type LetterType =
  | "USULAN_PESERTA"
  | "TIDAK_MAMPU"
  | "JALUR_AFIRMASI"
  | "KEHILANGAN_KK"
  | "PENGANTAR"
  | "DOMISILI"
  | "USAHA";

export interface LetterTypeInfo {
  id: LetterType;
  title: string;
  description: string;
}

export const letterTypes: LetterTypeInfo[] = [
  {
    id: "USULAN_PESERTA",
    title: "Surat Keterangan Usulan Peserta",
    description: "Surat untuk mengusulkan seseorang sebagai peserta program",
  },
  {
    id: "TIDAK_MAMPU",
    title: "Surat Keterangan Tidak Mampu",
    description: "Surat yang menerangkan ketidakmampuan ekonomi seseorang",
  },
  {
    id: "JALUR_AFIRMASI",
    title: "Surat Keterangan Jalur Afirmasi (Tidak Mampu)",
    description: "Surat untuk jalur afirmasi pendidikan bagi yang tidak mampu",
  },
  {
    id: "KEHILANGAN_KK",
    title: "Surat Keterangan Kehilangan Kartu Keluarga (KK)",
    description: "Surat keterangan kehilangan kartu keluarga",
  },
  {
    id: "PENGANTAR",
    title: "Surat Pengantar",
    description: "Surat pengantar untuk berbagai keperluan",
  },
  {
    id: "DOMISILI",
    title: "Surat Keterangan Domisili Tempat Tinggal",
    description: "Surat yang menerangkan domisili seseorang",
  },
  {
    id: "USAHA",
    title: "Surat Keterangan Usaha",
    description: "Surat keterangan untuk kepemilikan usaha",
  },
];

export interface CommonLetterData {
  letterType: LetterType;
  noTelp: string;
  keteranganTambahan: string;
}

export interface UsulanPesertaData extends CommonLetterData {
  letterType: "USULAN_PESERTA";
}

export interface TidakMampuData extends CommonLetterData {
  letterType: "TIDAK_MAMPU";
  kewarganegaraan: string;
}

export interface JalurAfirmasiData extends CommonLetterData {
  letterType: "JALUR_AFIRMASI";
  namaAnak: string;
  namaSekolah: string;
  idjtg: string;
  tempatLahirAnak: string;
  tanggalLahirAnak: string;
  nikAnak: string;
  alamatAnak: string;
}

export interface KehilanganKKData extends CommonLetterData {
  letterType: "KEHILANGAN_KK";
}

export interface PengantarData extends CommonLetterData {
  letterType: "PENGANTAR";
  keteranganLain: string;
  pesanSurat: string;
}

export interface DomisiliData extends CommonLetterData {
  letterType: "DOMISILI";
  binBinti: string;
  kewarganegaraan: string;
  alamatKTP: string;
  alamatDomisili: string;
  lamaTinggal: string;
  keperluan: string;
}

export interface UsahaData extends CommonLetterData {
  letterType: "USAHA";
  keperluan: string;
  masaBerlaku: string;
}

export type LetterData =
  | UsulanPesertaData
  | TidakMampuData
  | JalurAfirmasiData
  | KehilanganKKData
  | PengantarData
  | DomisiliData
  | UsahaData;
