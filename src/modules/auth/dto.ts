export interface RegisterDto {
  name: string;
  nip: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginDto {
  email: string;
  password: string;
  remember_password?: boolean;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  new_password: string;
  confirm_password: string;
  token?: string;
}

export interface RefreshTokenDto {
  access_token?: string;
  refresh_token?: string;
}

export interface AuthTokenResponse {
  token_type: "Bearer";
  access_token: string;
  refresh_token: string;
}