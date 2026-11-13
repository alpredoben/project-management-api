/** Excape wildcard character (`% _ \`) for LIKE/ILIKE. */
export const escapeLike = (value: string): string =>
  value.replace(/[\\%_]/g, "\\$&");
