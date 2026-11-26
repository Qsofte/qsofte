import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setSignedOutHandler, type User } from './api';

type AuthState =
  | { status: 'checking' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: User };

interface Auth {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signedOut: () => void;
}

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'checking' });
  const signedOut = useCallback(() => setState({ status: 'signed-out' }), []);

  useEffect(() => {
    setSignedOutHandler(signedOut);
    api
      .me()
      .then((user) => setState({ status: 'signed-in', user }))
      .catch(() => setState({ status: 'signed-out' }));
  }, [signedOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await api.login(email, password);
    setState({ status: 'signed-in', user });
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setState({ status: 'signed-out' });
  }, []);

  return <AuthContext.Provider value={{ state, signIn, signOut, signedOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
