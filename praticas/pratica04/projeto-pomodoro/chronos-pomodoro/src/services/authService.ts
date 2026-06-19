import { MOCK_CREDENTIALS } from '../constants/auth';

export const authService = {
  mockUser: MOCK_CREDENTIALS.username,
  mockPassword: MOCK_CREDENTIALS.password,

  login(username: string, password: string) {
    return (
      username.trim() === MOCK_CREDENTIALS.username &&
      password === MOCK_CREDENTIALS.password
    );
  },
};
