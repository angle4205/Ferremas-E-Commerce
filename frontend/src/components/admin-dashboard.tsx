import React from "react";
import { Sidebar } from "./admin-components/sidebar";
import { DashboardHeader } from "./admin-components/dashboard-header";
import { DashboardOverview } from "./admin-components/dashboard-overview";
import { Orders } from "./admin-components/orders"; // Importamos el componente de Órdenes
import { SalesChart } from "./admin-components/sales-chart";
import { RecentOrders } from "./admin-components/recent-orders";
import { InventoryStatus } from "./admin-components/inventory-status";

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
  onHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  darkMode,
  setDarkMode,
  perfil,
  onProfile,
  onLogout,
  onHome,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState("dashboard"); // Estado para manejar la página actual

  // Función para renderizar el contenido según la página seleccionada
  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <>
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
          </>
        );
      case "orders":
        return <Orders />; // Renderizamos el componente de Órdenes
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full ${darkMode ? "dark" : ""}`}>
      <div className="flex flex-1 bg-background dark:bg-background-dark overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onNavigate={setCurrentPage} // Pasamos la función para cambiar de página
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            collapsed={collapsed}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            perfil={perfil}
            onProfile={onProfile}
            onLogout={onLogout}
            onHome={onHome}
          />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1400px] mx-auto space-y-6">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;