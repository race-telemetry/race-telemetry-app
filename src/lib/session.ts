/**
 * Penyimpanan token JWT.
 *
 * Disimpan di localStorage supaya sesi tetap hidup setelah tab ditutup.
 * Catatan keamanan: localStorage rawan XSS — untuk produksi ketat, pindahkan ke
 * cookie HttpOnly (butuh perubahan di server).
 */
const KEY = 'rtapp.token'

export function loadToken(): string | null {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null // mode privat / storage diblokir
  }
}

export function saveToken(token: string): void {
  try {
    window.localStorage.setItem(KEY, token)
  } catch {
    /* diabaikan */
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* diabaikan */
  }
}
