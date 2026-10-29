import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class PasswordUtil {
  public static async verifyPassword(
    plainPassword: string,
    storedHash: string
  ): Promise<{ isValid: boolean; isMd5: boolean }> {
    if (!storedHash || !plainPassword) {
      return { isValid: false, isMd5: false };
    }

    // Check hash bcrypt (Laravel $2y$ / standard $2a$ / $2b$)
    if (
      storedHash.startsWith('$2y$') ||
      storedHash.startsWith('$2a$') ||
      storedHash.startsWith('$2b$')
    ) {
      // Normalized  2y$ Laravel version to $2a$ library bcrypt Node.js
      const normalizedHash = storedHash.replace(/^\$2y\$/, '$2a$');
      const isValid = await bcrypt.compare(plainPassword, normalizedHash);

      return { isValid, isMd5: false };
    }

    // Check hash legacy MD5
    if (storedHash.length === 32) {
      const inputMd5 = crypto
        .createHash('md5')
        .update(plainPassword)
        .digest('hex');
      const isValid = crypto.timingSafeEqual(
        Buffer.from(inputMd5, 'utf-8'),
        Buffer.from(storedHash, 'utf-8')
      );

      return { isValid, isMd5: true };
    }

    return { isValid: false, isMd5: false };
  }

  /**
   * Create bcrypt hash standar laravel from plain password
   */
  public static async makeLaravelHash(plainPassword: string): Promise<string> {
    const hash = await bcrypt.hash(plainPassword, 10);
    return hash.replace(/^\$2a\$/, '$2y$');
  }
}
