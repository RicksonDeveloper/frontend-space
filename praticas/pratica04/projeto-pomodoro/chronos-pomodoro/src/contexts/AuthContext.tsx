import { createContext, useContext, useReducer } from 'react';
import { authService } from '../services/authService';

const AUTH_STORAGE_KEY = 'chronos-pomodoro-auth-user';

type AuthState = {
  lastLoginUser: string;
  isAuthenticated: boolean;
};

type AuthAction = {
  type: 'LOGIN_ATTEMPT';
  payload: {
    user: string;
  };
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitialAuthState(): AuthState {
  const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY) ?? '';

  return {
    lastLoginUser: storedUser,
    isAuthenticated: Boolean(storedUser),
  };
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_ATTEMPT':
      return {
        ...state,
        lastLoginUser: action.payload.user,
        isAuthenticated: true,
      };

    default:
      return state;
  }
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialAuthState);

  function login(username: string, password: string) {
    const isValidLogin = authService.login(username, password);

    if (isValidLogin) {
      const user = username.trim();

      sessionStorage.setItem(AUTH_STORAGE_KEY, user);
      dispatch({
        type: 'LOGIN_ATTEMPT',
        payload: {
          user,
        },
      });
    }

    return isValidLogin;
  }

  return (
    <AuthContext.Provider
      value={{
        lastLoginUser: state.lastLoginUser,
        isAuthenticated: state.isAuthenticated,
        login,
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
