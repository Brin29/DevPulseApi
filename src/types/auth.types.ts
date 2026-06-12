import { RegisterModel } from "../models/auth.model";
import { LoginModel } from "../models/auth.model";
import { CodeModel } from "../models/auth.model";
import { VerifyCodeRequest } from "../models/auth.model";
import { MagicLinkRequest } from "../models/magicLink.model";
import { Request } from "../models/request.model";

export interface RegisterRequest {
  Body: Request<RegisterModel>;
}

// export interface GoogleCallBack{
//   Body: Request<>
// }

export interface LoginRequest {
  Body: Request<LoginModel>;
}

export interface CodeGenerateRequest {
  Body: Request<CodeModel>;
}

export interface VerifyCodeRequestType {
  Body: Request<VerifyCodeRequest>;
}

export interface CheckEmailRequest {
  Body: Request<{ email: string }>;
}

export interface MagicLinkGenerateRequest {
  Body: Request<{ email: string }>;
}

export interface VerifyMagicTokenRequest {
  Body: Request<MagicLinkRequest>;
}

export interface RefreshTokenRequest {
  Body: Request<{ refresh_token: string }>;
}

export interface EditProfileRequest {
  Body: Request<{ firstName?: string; lastName?: string, avatarUrl?: string }>;
}

// GetProfile has no body, so no type needed (or we could define empty)