import React, { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import EmployeesPage from "../../components/admin/EmployeesPage";
import ReportsPage from "../../components/admin/ReportsPage";
import DiscountsPage from "../../components/admin/DiscountsPage";
import ShiftsPage from "../../components/admin/ShiftsPage";
import AuditPage from "../../components/admin/AuditPage";
import DashboardHeader from "../../components/admin/DashboardHeader";
import DashboardOverview from "../../components/admin/DashboardOverview";
import OrdersTable from "../../components/admin/OrdersTable";
import SalesChart from "../../components/admin/SalesChart";
import RecentOrders from "../../components/admin/RecentOrders";
import InventoryStatus from "../../components/admin/InventoryStatus";
import { Spinner } from "@heroui/react";

type PerfilUsuario = {
  username: string;
  email: string;
  foto_url?: string | null;
};

interface AdminDashboardPageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  perfil: PerfilUsuario | null;
  onProfile: () => void;
  onLogout: () => void;
  onHome: () => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  darkMode,
  setDarkMode,
  perfil,
  onProfile,
  onLogout,
  onHome,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState("dashboard");

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
        return <OrdersTable />;
      case "employees":
        return <EmployeesPage />;
      case "reports":
        return <ReportsPage />;
      case "discounts":
        return <DiscountsPage />;
      case "shifts":
        return <ShiftsPage />;
      case "audit":
        return <AuditPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full ${darkMode ? "dark" : ""}`}>
      <div className="flex flex-1 bg-background dark:bg-background-dark overflow-hidden">
        <Sidebar onNavigate={setCurrentPage} rol="" />
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
            <div className="max-w-[1400px] mx-auto space-y-6">
              {perfil ? (
                renderContent()
              ) : (
                <div className="flex justify-center items-center min-h-screen">
                  <Spinner size="lg" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;