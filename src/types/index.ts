export interface User {
  id: number;
  username: string;
  password?: string; // Optional for non-local strategies
  facebookId?: string;
  googleId?: string;
  twitterId?: string;
  email?: string;
  thumbnail?: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  userId: string;
}
