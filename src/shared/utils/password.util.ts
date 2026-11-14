import * as bcrypt from 'bcrypt';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 12;

  public static async hashPassword(plainPassword: string): Promise<string> {
    try {
      if (!plainPassword) {
        throw new Error('Password tidak boleh kosong.');
      }
      return await bcrypt.hash(plainPassword, PasswordUtil.SALT_ROUNDS);
    } catch (error: any) {
      throw new Error(`Gagal melakukan hashing password: ${error.message}`);
    }
  }

  public static async verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
    try {
      if (!plainPassword || !storedHash) {
        return false;
      }
      return await bcrypt.compare(plainPassword, storedHash);
    } catch (error) {
      // Jika format storedHash rusak/tidak valid, kembalikan false demi keamanan
      return false;
    }
  }
}