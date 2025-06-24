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
import { Icon } from "@iconify/react";
import Error404Page from "../Error404Page";

type PerfilUsuario = {
  username: string;
  email: string;
  foto_url?: string | null;
  rol?: string | null;
  subrol?: string | null;
  tipo_empleado?: string | null;
};

interface AdminDashboardPageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  perfil: PerfilUsuario | null;
  onProfile: () => void;
  onLogout: () => void;
  onHome: () => void;
}

const getSubrol = (perfil: PerfilUsuario | null) => {
  if (!perfil) return "";
  return (perfil.tipo_empleado || perfil.subrol || "").toUpperCase().trim();
};

const getInitialPage = (rol: string, subrol: string) => {
  if (rol === "ADMINISTRADOR") return "dashboard";
  if (rol === "EMPLEADO" && subrol === "CONTADOR") return "dashboard";
  if (rol === "EMPLEADO" && subrol === "BODEGUERO") return "turno";
  if (rol === "EMPLEADO") return "turno";
  return "turno";
};

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  darkMode,
  setDarkMode,
  perfil,
  onProfile,
  onLogout,
  onHome,
}) => {
  const rol = (perfil?.rol || "").toUpperCase().trim();
  const subrol = getSubrol(perfil);

  // Inicializa currentPage según el rol/subrol
  const [currentPage, setCurrentPage] = React.useState(() =>
    getInitialPage(rol, subrol)
  );
  const [collapsed, setCollapsed] = React.useState(false);

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
      // Pestañas sin lógica implementada:
      case "turno":
      case "ordenes-bodeguero":
        return <Error404Page onGoHome={onHome} />;
      default:
        return <Error404Page onGoHome={onHome} />;
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full ${darkMode ? "dark" : ""}`}>
      <div className="flex flex-1 bg-background dark:bg-background-dark overflow-hidden">
        <Sidebar
          onNavigate={setCurrentPage}
          rol={rol}
          subrol={getSubrol(perfil)}
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