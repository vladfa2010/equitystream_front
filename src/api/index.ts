// API layer — all calls go through localStorage (demo mode)
// Swap localDb.ts for real API calls when backend is ready
export * from './types';
export * from './services/auth';
export * from './services/deals';
export * from './services/clients';
export * from './services/materials';
export * from './services/dashboard';
export * from './localDb';
