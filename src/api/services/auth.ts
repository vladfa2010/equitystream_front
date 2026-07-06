import type { LoginRequest, LoginResponse, UserDto } from '../types';

// Default credentials for demo
const DEFAULT_USERS: Record<string, { password: string; user: UserDto }> = {
  'user@equitystream.com': {
    password: 'user',
    user: { id: 'u_user', email: 'user@equitystream.com', name: 'User', role: 'user', avatarUrl: null },
  },
  'admin@equitystream.com': {
    password: 'admin',
    user: { id: 'u_admin', email: 'admin@equitystream.com', name: 'Admin', role: 'admin', avatarUrl: null },
  },
  'superadmin@equitystream.com': {
    password: 'superadmin',
    user: { id: 'u_superadmin', email: 'superadmin@equitystream.com', name: 'Superadmin', role: 'superadmin', avatarUrl: null },
  },
};

function storeLoggedInUser(user: UserDto) {
  localStorage.setItem('es_logged_in_user', JSON.stringify(user));
}

function getLoggedInUser(): UserDto | null {
  try {
    const raw = localStorage.getItem('es_logged_in_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    await new Promise(r => setTimeout(r, 500));

    const entry = DEFAULT_USERS[data.email.toLowerCase()];
    if (!entry || entry.password !== data.password) {
      throw new Error('Invalid email or password. Try: user@equitystream.com / user, admin@equitystream.com / admin, or superadmin@equitystream.com / superadmin');
    }

    const token = `demo_token_${Date.now()}`;
    localStorage.setItem('accessToken', token);
    storeLoggedInUser(entry.user);
    return { accessToken: token, user: entry.user };
  },

  register: async (data: { email: string; password: string; name: string; role: string }) => {
    await new Promise(r => setTimeout(r, 500));
    return { id: `u_${Date.now()}`, email: data.email, name: data.name, role: data.role };
  },

  me: async (): Promise<UserDto> => {
    await new Promise(r => setTimeout(r, 200));
    const user = getLoggedInUser();
    if (user) return user;
    // Fallback — default admin
    return DEFAULT_USERS['admin@equitystream.com'].user;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('es_logged_in_user');
  },
};
