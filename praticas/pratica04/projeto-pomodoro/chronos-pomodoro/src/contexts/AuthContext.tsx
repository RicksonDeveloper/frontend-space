import { createContext, useContext, useEffect, useReducer } from 'react';
import { authService, type AuthUser } from '../services/authService';

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_LOGOUT' };

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>;
  resetPassword: (token: string, password: string) => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    async function validateSession() {
      const token = authService.getToken();

      if (!token) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }

      try {
        const { user } = await authService.me();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch {
        authService.clearToken();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    }

    validateSession();
  }, []);

  async function login(email: string, password: string) {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.login(email, password);
      authService.setToken(response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  }

  async function register(name: string, email: string, password: string) {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.register(name, email, password);
      authService.setToken(response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  }

  async function logout() {
    try {
      if (authService.getToken()) {
        await authService.logout();
      }
    } finally {
      authService.clearToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }

  async function forgotPassword(email: string) {
    return authService.forgotPassword(email);
  }

  async function resetPassword(token: string, password: string) {
    const response = await authService.resetPassword(token, password);
    return response.message;
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
