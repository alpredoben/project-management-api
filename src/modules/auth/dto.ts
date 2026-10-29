export interface In_DTO_Login {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface In_DTO_RefreshToken {
  refreshToken: string;
}
