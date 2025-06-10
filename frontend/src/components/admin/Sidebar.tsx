import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface SidebarProps {
  rol: string; // Rol del usuario (e.g., "administrador", "empleado", etc.)
  onNavigate: (page: string) => void; // Función para manejar la navegación
}

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick }) => (
  <Button
    className="justify-start h-12"
    color={active ? "primary" : "default"}
    variant="flat"
    startContent={<Icon icon={icon} width={20} height={20} />}
    fullWidth
    onClick={onClick}
  >
    <span>{label}</span>
  </Button>
);

const Sidebar: React.FC<SidebarProps> = ({ rol, onNavigate }) => {
  // Puedes agregar lógica para mostrar/ocultar ítems según el rol si lo necesitas
  return (
    <aside className="bg-content1 border-r border-divider flex flex-col w-[240px]">
      <div className="flex items-center h-16 px-4 border-b border-divider">
        <Icon icon="lucide:tool" width={24} height={24} className="text-primary" />
        <span className="font-semibold text-lg ml-2">Gestión FERREMAS</span>
      </div>

      <nav className="flex flex-col p-2 gap-1 flex-1">
        {/* Pestañas principales */}
        <NavItem icon="lucide:layout-dashboard" label="Resumen General" onClick={() => onNavigate("dashboard")} />
        <NavItem icon="lucide:shopping-bag" label="Órdenes" onClick={() => onNavigate("orders")} />
        <NavItem icon="lucide:users" label="Empleados" onClick={() => onNavigate("employees")} />

        {/* Pestañas de gestión */}
        <NavItem icon="lucide:file-text" label="Reportes Financieros" onClick={() => onNavigate("reports")} />
        <NavItem icon="lucide:percent" label="Descuentos" onClick={() => onNavigate("discounts")} />
        <NavItem icon="lucide:clock" label="Historial de Turnos" onClick={() => onNavigate("shifts")} />

        {/* Pestañas adicionales */}
        <NavItem icon="lucide:shield" label="Auditoría" onClick={() => onNavigate("audit")} />
      </nav>

      <div className="p-2 border-t border-divider">
        <Button
          className="justify-start"
          color="default"
          variant="flat"
          startContent={<Icon icon="lucide:log-out" width={20} height={20} />}
          fullWidth
        >
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;