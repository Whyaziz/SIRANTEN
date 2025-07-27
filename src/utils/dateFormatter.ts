/**
 * Formats a date to a localized Indonesian format
 * @param date - The date to format
 * @param format - Optional format type (default, romawi)
 * @returns The formatted date string
 */
export function formatDate(
  date: Date,
  format: "default" | "romawi" = "default"
): string {
  if (format === "romawi") {
    const romanMonths = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
      "XII",
    ];
    return romanMonths[date.getMonth()];
  }

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return `${day} ${months[monthIndex]} ${year}`;
}
