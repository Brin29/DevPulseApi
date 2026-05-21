export interface IVerificationToken {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface IVerificationTokenMethods {
  compareCode(code: string): Promise<boolean>;
}