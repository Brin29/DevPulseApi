export interface IVerificationToken {
  email: string;
  code: string;
  attempts: number;
  expiresAt: Date;
}

export interface IVerificationTokenMethods {
  compareCode(code: string): Promise<boolean>;
}