import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiFetch, clearToken, getToken, setToken } from "@/utils/api";

type Role = "restaurant" | "ngo" | null;

type AuthedUser = {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, null>;
  address?: string;
};

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  userName: string;
  userAddress: string;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: Exclude<Role, null>; address?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const PROFILE_STORAGE_KEY = "feedforward_profiles_v1";

type PersistedAuth = {
  isAuthenticated: boolean;
  role: Role;
  userName: string;
  userAddress: string;
  token: string | null;
};

type Profiles = {
  ngoName?: string;
  restaurantName?: string;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const persisted = useMemo(() => {
    try {
      const raw = localStorage.getItem("feedforward_auth_v2");
      return raw ? (JSON.parse(raw) as PersistedAuth) : null;
    } catch {
      return null;
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(persisted?.isAuthenticated ?? false);
  const [role, setRole] = useState<Role>(persisted?.role ?? null);
  const [userName, setUserName] = useState(persisted?.userName ?? "");
  const [userAddress, setUserAddress] = useState(persisted?.userAddress ?? "");
  const [token, setTokenState] = useState<string | null>(persisted?.token ?? getToken());

  const [profiles, setProfiles] = useState<Profiles>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Profiles) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const payload: PersistedAuth = { isAuthenticated, role, userName, userAddress, token };
    localStorage.setItem("feedforward_auth_v2", JSON.stringify(payload));
  }, [isAuthenticated, role, userName, userAddress, token]);

  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "feedforward_auth_v2") return;
      try {
        const next = e.newValue ? (JSON.parse(e.newValue) as PersistedAuth) : null;
        if (!next) return;
        setIsAuthenticated(next.isAuthenticated);
        setRole(next.role);
        setUserName(next.userName);
        setUserAddress(next.userAddress ?? "");
        setTokenState(next.token);
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const applyAuth = (user: AuthedUser, jwt: string) => {
    setIsAuthenticated(true);
    setRole(user.role);
    setUserName(user.name);
    setUserAddress(user.address ?? "");
    setToken(jwt);
    setTokenState(jwt);
    if (user.role === "ngo") setProfiles((p) => ({ ...p, ngoName: user.name }));
    if (user.role === "restaurant") setProfiles((p) => ({ ...p, restaurantName: user.name }));
  };

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: AuthedUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    applyAuth(res.user, res.token);
  };

  const register = async (payload: { name: string; email: string; password: string; role: Exclude<Role, null>; address?: string }) => {
    const res = await apiFetch<{ token: string; user: AuthedUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    applyAuth(res.user, res.token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUserName("");
    setUserAddress("");
    setTokenState(null);
    clearToken();
    localStorage.removeItem("feedforward_auth_v2");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userName, userAddress, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export function getLastProfileName(target: "ngo" | "restaurant"): string | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profiles;
    return target === "ngo" ? (p.ngoName ?? null) : (p.restaurantName ?? null);
  } catch {
    return null;
  }
}
