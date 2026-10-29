import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { In_AUTH_JwtPayload } from '../interfaces/auth.interface';

export class JwtService {
  private static readonly secret = config.pkg.jwt.secret;

  private static readonly ttl = `${config.pkg.jwt.ttl}m`;
  private static readonly refreshTtl = `${config.pkg.jwt.refreshTtl}m`;

  public static generateAccessToken(
    payload: In_AUTH_JwtPayload,
    rememberMe: boolean = false
  ): string {
    const options: SignOptions = {
      expiresIn: rememberMe ? '7d' : (this.ttl as any),
    };
    return jwt.sign(payload, this.secret, options);
  }

  public static generateRefreshToken(
    payload: In_AUTH_JwtPayload,
    rememberMe: boolean = false
  ): string {
    const options: SignOptions = {
      expiresIn: rememberMe ? '30d' : (this.refreshTtl as any),
    };
    return jwt.sign(payload, this.secret, options);
  }

  public static verifyToken(token: string): In_AUTH_JwtPayload {
    try {
      return jwt.verify(token, this.secret) as In_AUTH_JwtPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      throw new Error('Invalid token');
    }
  }
}
