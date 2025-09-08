export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  employeeId: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface BiometricCredentials {
  userId: string;
  enabled: boolean;
}