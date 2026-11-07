/**
 * Format & Masking Utilities untuk ProtekSales
 */

/**
 * Menyembunyikan/menyamarkan nomor telepon seluler untuk akun Sales demi privasi klien (misal: 0812-****-5304)
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return "-";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length <= 6) return "****";
  const prefix = digits.slice(0, 4);
  const suffix = digits.slice(-4);
  return `${prefix}-****-${suffix}`;
}

/**
 * Format nominal Rupiah
 */
export function formatRupiah(amount: number): string {
  return `Rp ${Math.round(amount || 0).toLocaleString("id-ID")}`;
}
