import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import PendingApprovalPage from '@/pages/PendingApprovalPage';
import AdminDashboard from '@/pages/admin/Dashboard';
import DealEditor from '@/pages/admin/DealEditor';
import DealDetailAdmin from '@/pages/admin/DealDetail';
import DealsList from '@/pages/admin/DealsList';
import ClientsList from '@/pages/admin/ClientsList';
import ClientDetailAdmin from '@/pages/admin/ClientDetail';
import CreateClient from '@/pages/admin/CreateClient';
import MaterialsLibrary from '@/pages/admin/MaterialsLibrary';
import AdminUsersList from '@/pages/admin/AdminUsersList';
import ClientDashboard from '@/pages/client/Dashboard';
import ClientDealView from '@/pages/client/DealView';
import AvailableDeals from '@/pages/client/AvailableDeals';
import Market from '@/pages/client/Market';
import DealTrading from '@/pages/client/DealTrading';

function ProtectedRoute({ children, requireAdmin = false, requireVerified = true }: { children: React.ReactNode; requireAdmin?: boolean; requireVerified?: boolean }) {
  const { isAuthenticated, isAdmin, isVerified, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#B8A14E] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requireVerified && !isVerified) return <Navigate to="/pending" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function VerifiedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isVerified, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#B8A14E] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isVerified) return <Navigate to="/pending" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LoginPage />} />

      {/* Pending approval (authenticated but not verified) */}
      <Route path="/pending" element={<ProtectedRoute requireVerified={false}><PendingApprovalPage /></ProtectedRoute>} />

      {/* Client routes — verified users only */}
      <Route path="/dashboard" element={<VerifiedRoute><ClientDashboard /></VerifiedRoute>} />
      <Route path="/deals/:id" element={<VerifiedRoute><ClientDealView /></VerifiedRoute>} />
      <Route path="/deals/available" element={<VerifiedRoute><AvailableDeals /></VerifiedRoute>} />
      <Route path="/market" element={<VerifiedRoute><Market /></VerifiedRoute>} />
      <Route path="/market/:id" element={<VerifiedRoute><DealTrading /></VerifiedRoute>} />

      {/* Admin routes — admin + verified */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/deals" element={<ProtectedRoute requireAdmin><DealsList /></ProtectedRoute>} />
      <Route path="/admin/deals/new" element={<ProtectedRoute requireAdmin><DealEditor /></ProtectedRoute>} />
      <Route path="/admin/deals/:id" element={<ProtectedRoute requireAdmin><DealDetailAdmin /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute requireAdmin><ClientsList /></ProtectedRoute>} />
      <Route path="/admin/clients/new" element={<ProtectedRoute requireAdmin><CreateClient /></ProtectedRoute>} />
      <Route path="/admin/clients/:id" element={<ProtectedRoute requireAdmin><ClientDetailAdmin /></ProtectedRoute>} />
      <Route path="/admin/materials" element={<ProtectedRoute requireAdmin><MaterialsLibrary /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsersList /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
