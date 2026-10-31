import { randomUUID } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import {
  In_AUTH_JwtPayload,
  In_AUTH_TokenType,
} from "../interfaces/auth.interface";

export class JwtService {
  private static readonly secret = config.pkg.jwt.secret;

  private static readonly ttl = config.pkg.jwt.ttl * 60;
  private static readonly refreshTtl = config.pkg.jwt.refreshTtl * 60;

  public static generateAccessToken(
    payload: Omit<In_AUTH_JwtPayload, "token_type">,
    rememberMe: boolean = false,
  ): string {
    const options: SignOptions = {
      expiresIn: rememberMe ? "7d" : this.ttl,
    };
    return jwt.sign(
      { ...payload, remember_me: rememberMe, token_type: "access" },
      this.secret,
      options,
    );
  }

  public static generateRefreshToken(
    payload: Omit<In_AUTH_JwtPayload, "token_type">,
    rememberMe: boolean = false,
  ): string {
    const options: SignOptions = {
      expiresIn: rememberMe ? "30d" : this.refreshTtl,
      jwtid: randomUUID(),
    };
    return jwt.sign(
      { ...payload, remember_me: rememberMe, token_type: "refresh" },
      this.secret,
      options,
    );
  }

  public static verifyToken(
    token: string,
    expectedType: In_AUTH_TokenType = "access",
  ): In_AUTH_JwtPayload {
    try {
      const payload = jwt.verify(token, this.secret);

      if (
        typeof payload === "string" ||
        typeof payload["id"] !== "string" ||
        payload["id"].trim().length === 0 ||
        typeof payload["email"] !== "string" ||
        payload["email"].trim().length === 0 ||
        (payload["userId"] !== undefined &&
          payload["userId"] !== payload["id"]) ||
        (payload["remember_me"] !== undefined &&
          typeof payload["remember_me"] !== "boolean") ||
        (payload["token_type"] !== "access" &&
          payload["token_type"] !== "refresh") ||
        payload["token_type"] !== expectedType
      ) {
        throw new Error("Invalid token payload");
      }

      return {
        id: payload["id"],
        email: payload["email"],
        token_type: payload["token_type"],
        remember_me: payload["remember_me"] === true,
      } as In_AUTH_JwtPayload;
    } catch {
      throw new Error("Invalid or expired token");
    }
  }
}
