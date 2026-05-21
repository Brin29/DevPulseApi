export interface RegisterModel {
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginModel {
  email: string;
  password: string;
}

export interface CodeModel {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}