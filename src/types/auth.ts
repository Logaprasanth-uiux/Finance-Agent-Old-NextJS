export interface Organization {
  id: string;
  name: string;
  category: string;
  descriptor: string;
  logoInitial: string;
  logoGradient: string;
  badge?: string;
  role: string;
  activeModules: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  email: string;
  selectedOrg: Organization | null;
}
