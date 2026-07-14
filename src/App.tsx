import { Routes, Route } from 'react-router-dom';
import RouteSelector from '@/pages/RouteSelector';
import AdminDashboard from '@/pages/admin/Dashboard';
import DealEditor from '@/pages/admin/DealEditor';
import DealDetailAdmin from '@/pages/admin/DealDetail';
import DealsList from '@/pages/admin/DealsList';
import ClientsList from '@/pages/admin/ClientsList';
import ClientDetailAdmin from '@/pages/admin/ClientDetail';
import CreateClient from '@/pages/admin/CreateClient';
import MaterialsLibrary from '@/pages/admin/MaterialsLibrary';
import ClientDashboard from '@/pages/client/Dashboard';
import ClientDealView from '@/pages/client/DealView';
import AvailableDeals from '@/pages/client/AvailableDeals';
import Market from '@/pages/client/Market';
import DealTrading from '@/pages/client/DealTrading';

export default function App() {
  return (
    <Routes>
      {/* Route selector at root */}
      <Route path="/" element={<RouteSelector />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/deals" element={<DealsList />} />
      <Route path="/admin/deals/new" element={<DealEditor />} />
      <Route path="/admin/deals/:id" element={<DealDetailAdmin />} />
      <Route path="/admin/clients" element={<ClientsList />} />
      <Route path="/admin/clients/new" element={<CreateClient />} />
      <Route path="/admin/clients/:id" element={<ClientDetailAdmin />} />
      <Route path="/admin/materials" element={<MaterialsLibrary />} />

      {/* Client routes */}
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="/deals/:id" element={<ClientDealView />} />
      <Route path="/deals/available" element={<AvailableDeals />} />
      <Route path="/market" element={<Market />} />
      <Route path="/market/:id" element={<DealTrading />} />
    </Routes>
  );
}
