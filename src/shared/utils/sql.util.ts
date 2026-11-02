/** Meng-escape karakter wildcard (`% _ \`) agar input pencarian dianggap teks biasa di LIKE/ILIKE. */
export const escapeLike = (value: string): string =>
  value.replace(/[\\%_]/g, "\\$&");
