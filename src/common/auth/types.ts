export type UserRole = "CUSTOMER" | "MOVER";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  customerId?: string;
  moverId?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}
