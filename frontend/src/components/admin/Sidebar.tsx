import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface SidebarProps {
  rol: string;
  subrol?: string | null;
  onNavigate: (page: string) => void;
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

const getSidebarTitle = (rol: string, subrol?: string | null) => {
  const r = (rol || "").toUpperCase();
  const s = (subrol || "").toUpperCase();
  if (r === "ADMINISTRADOR") return "Administración";
  if (r === "EMPLEADO" && s === "CONTADOR") return "Panel Contador";
  if (r === "EMPLEADO" && s === "BODEGUERO") return "Panel Bodeguero";
  if (r === "EMPLEADO") return "Panel Empleado";
  return "Gestión FERREMAS";
};

const Sidebar: React.FC<SidebarProps> = ({ rol, subrol, onNavigate }) => {
  const opcionesSidebar = [
    // Turno para todos los empleados
    { label: "Turno", page: "turno", icon: "lucide:clock", roles: ["EMPLEADO"] },
    // Resumen y reportes: solo admin
    { label: "Resumen General", page: "dashboard", icon: "lucide:layout-dashboard", roles: ["ADMINISTRADOR"] },
    { label: "Reportes Financieros", page: "reports", icon: "lucide:file-text", roles: ["ADMINISTRADOR"] },
    // Solo contador
    { label: "Resumen General", page: "dashboard", icon: "lucide:layout-dashboard", roles: ["EMPLEADO"], subroles: ["CONTADOR"] },
    { label: "Reportes Financieros", page: "reports", icon: "lucide:file-text", roles: ["EMPLEADO"], subroles: ["CONTADOR"] },
    // Solo bodeguero
    { label: "Órdenes Asignadas", page: "ordenes-bodeguero", icon: "lucide:clipboard-list", roles: ["EMPLEADO"], subroles: ["BODEGUERO"] },
    // Solo admin
    { label: "Órdenes", page: "ordenes", icon: "lucide:clipboard-list", roles: ["ADMINISTRADOR"] },
    { label: "Empleados", page: "employees", icon: "lucide:users", roles: ["ADMINISTRADOR"] },
    { label: "Descuentos", page: "discounts", icon: "lucide:percent", roles: ["ADMINISTRADOR"] },
    { label: "Historial de Turnos", page: "shifts", icon: "lucide:history", roles: ["ADMINISTRADOR"] },
    { label: "Auditoría", page: "audit", icon: "lucide:shield", roles: ["ADMINISTRADOR"] },
  ];

  const normalizar = (v: string | null | undefined) =>
    (v || "").toUpperCase().trim();

  const opcionesVisibles = opcionesSidebar.filter(opt => {
    const r = normalizar(rol);
    const s = normalizar(subrol);
    if (!opt.roles.includes(r)) return false;
    if (!opt.subroles) return true;
    // Para admin, subrol puede ser null o vacío
    if (r === "ADMINISTRADOR") return true;
    // Para empleados, debe coincidir el subrol
    return opt.subroles.map(normalizar).includes(s);
  });

  return (
    <aside className="bg-content1 border-r border-divider flex flex-col w-[240px]">
      <div className="flex items-center h-16 px-4 border-b border-divider">
        <Icon icon="lucide:tool" width={24} height={24} className="text-primary" />
        <span className="font-semibold text-lg ml-2">
          {getSidebarTitle(rol, subrol)}
        </span>
      </div>

      <nav className="flex flex-col p-2 gap-1 flex-1">
        {opcionesVisibles.map((opcion) => (
          <NavItem
            key={`${opcion.page}-${opcion.label}`}
            icon={opcion.icon}
            label={opcion.label}
            onClick={() => onNavigate(opcion.page)}
          />
        ))}
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