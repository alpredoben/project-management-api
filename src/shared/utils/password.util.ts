import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { config } from "../../config";

const DEFAULT_PATTERN = /^\$2[aby]\$(\d{2})\$[./A-Za-z0-9]{53}$/;

// Baca "/pola/flags" dari .env menjadi RegExp
const loadPattern = (): RegExp => {
  const raw = config.security.password.pattern;
  if (!raw) return DEFAULT_PATTERN;
  const m = raw.match(/^\/(.+)\/([a-z]*)$/s);
  return m ? new RegExp(m[1], m[2]) : new RegExp(raw);
};

const ROUNDS = Number(config.security.password.salt ?? 10);
if (!Number.isInteger(ROUNDS) || ROUNDS < 4 || ROUNDS > 31) {
  throw new Error("BCRYPT_SALT_ROUNDS harus bilangan bulat 4-31.");
}
const HASH_PATTERN = loadPattern();
const MAX_BYTES = 72;
const CHARS =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*-_=+?";

export class PasswordUtil {
  static async hashPassword(plain: string): Promise<string> {
    if (!plain) throw new Error("Password must not be empty.");
    if (Buffer.byteLength(plain, "utf8") > MAX_BYTES) {
      throw new Error("Password exceeds bcrypt's 72-byte limit.");
    }
    return bcrypt.hash(plain, ROUNDS);
  }

  static async verifyPassword(
    plain: string,
    storedHash: string,
  ): Promise<boolean> {
    if (!plain || !storedHash) return false;
    if (Buffer.byteLength(plain, "utf8") > MAX_BYTES) return false;
    const m = storedHash.match(HASH_PATTERN);
    if (!m) return false;
    const cost = Number(m[1]);
    if (cost < 4 || cost > 31) return false;
    return bcrypt.compare(plain, storedHash.replace(/^\$2y\$/, "$2a$"));
  }

  static generatePassword(length = 16): string {
    if (!Number.isInteger(length) || length < 12 || length > 72) {
      throw new Error("Length harus bilangan bulat 12-72.");
    }
    return Array.from({ length }, () => CHARS[randomInt(CHARS.length)]).join(
      "",
    );
  }
}
