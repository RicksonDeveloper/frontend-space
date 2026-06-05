const API_URL = import.meta.env.VITE_CHRONOS_API_URL ?? 'http://localhost:3333';
const AUTH_TOKEN_KEY = 'chronos-pomodoro-auth-token';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message ?? 'Erro ao comunicar com a API.');
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export const authService = {
  getToken() {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  setToken(token: string) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  clearToken() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  },

  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(name: string, email: string, password: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  me() {
    const token = this.getToken();

    return request<{ user: AuthUser }>('/auth/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  logout() {
    const token = this.getToken();

    return request<void>('/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  forgotPassword(email: string) {
    return request<{ message: string; resetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(token: string, password: string) {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};
