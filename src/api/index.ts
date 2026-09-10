// API layer — real backend calls (ТЗ-4: session travels in the httpOnly
// cookie; no tokens in localStorage).
export * from './types';
export { authApi } from './services/authApi';
export type { AuthUser } from './services/authApi';
export * from './services/deals';
export * from './services/clients';
export * from './services/materials';
export * from './services/dashboard';
export * from './localDb';
