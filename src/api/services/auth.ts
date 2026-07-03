import type { LoginRequest, LoginResponse, UserDto } from '../types';

const MOCK_USER: UserDto = {
  id: 'u_admin',
  email: 'admin@equitystream.com',
  name: 'Admin',
  role: 'admin',
  avatarUrl: null,
};

export const authApi = {
  login: async (_data: LoginRequest): Promise<LoginResponse> => {
    await new Promise(r => setTimeout(r, 500));
    // Accept any email/password for demo
    const token = `demo_token_${Date.now()}`;
    localStorage.setItem('accessToken', token);
    return { accessToken: token, user: MOCK_USER };
  },

  register: async (data: { email: string; password: string; name: string; role: string }) => {
    await new Promise(r => setTimeout(r, 500));
    return { id: `u_${Date.now()}`, email: data.email, name: data.name, role: data.role };
  },

  me: async (): Promise<UserDto> => {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_USER;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
  },
};
