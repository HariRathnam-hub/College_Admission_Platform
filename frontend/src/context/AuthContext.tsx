import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AuthUser, LoginPayload, RegisterPayload, UserRole } from "@/features/auth/auth.types";
import { fetchCurrentUser, loginRequest, logoutRequest, registerRequest } from "@/features/auth/auth.api";
import { getAccessToken, setAccessToken } from "@/lib/axios";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload, expectedRole?: UserRole) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Administrator",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const current = await fetchCurrentUser();
      setUser(current);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (payload: LoginPayload, expectedRole?: UserRole) => {
    const { user: loggedInUser } = await loginRequest(payload);
    if (expectedRole && loggedInUser.role !== expectedRole) {
      // Wrong portal for this account — undo the login (clears token, revokes the
      // refresh token server-side) rather than granting access from the wrong page.
      await logoutRequest().catch(() => undefined);
      throw new Error(`This login is for ${ROLE_LABEL[expectedRole]} accounts only.`);
    }
    setUser(loggedInUser);
  };

  const register = async (payload: RegisterPayload) => {
    const { user: registeredUser } = await registerRequest(payload);
    setUser(registeredUser);
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
