export interface AdminProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface UpdateAdminProfilePayload {
  name?: string;
  phone?: string;
}

export interface ChangeAdminPasswordPayload {
  currentPassword: string;
  newPassword: string;
}
