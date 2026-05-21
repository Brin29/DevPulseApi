export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  isVerified: boolean;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}