import React from "react";
import { Sidebar } from "./admin-components/sidebar";
import { DashboardHeader } from "./admin-components/dashboard-header";
import { DashboardOverview } from "./admin-components/dashboard-overview";
import { RecentOrders } from "./admin-components/recent-orders";
import { InventoryStatus } from "./admin-components/inventory-status";
import { TopSellingProducts } from "./admin-components/top-selling-products";
import { SalesChart } from "./admin-components/sales-chart";

type PerfilUsuario = {
  username: string;
  email: string;
  foto_url?: string | null;
};

interface AdminDashboardProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  perfil: PerfilUsuario | null;
  onProfile: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  darkMode,
  setDarkMode,
  perfil,
  onProfile,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          collapsed={collapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          perfil={perfil}
          onProfile={onProfile}
          onLogout={onLogout}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <DashboardOverview />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesChart />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentOrders />
              </div>
              <div>
                <InventoryStatus />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;