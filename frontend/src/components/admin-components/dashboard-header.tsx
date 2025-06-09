import React from "react";
import { Avatar, Badge, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input, Switch } from "@heroui/react";
import { Icon } from "@iconify/react";

interface DashboardHeaderProps {
  collapsed: boolean;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  perfil: {
    username: string;
    email: string;
    foto_url?: string | null;
  } | null;
  onProfile: () => void;
  onLogout: () => void;
  onHome: () => void; // Nueva función para ir al inicio
}

export const DashboardHeader = ({
  collapsed,
  darkMode,
  setDarkMode,
  perfil,
  onProfile,
  onLogout,
  onHome, // Se recibe la función como prop
}: DashboardHeaderProps) => {
  return (
    <header className="h-16 border-b border-divider bg-content1 flex items-center px-4 lg:px-6">
      <div className="flex items-center gap-3 flex-1">
        <Input
          classNames={{
            base: "max-w-full sm:max-w-[18rem] h-10",
            inputWrapper: "h-10",
          }}
          placeholder="Buscar en dashboard..."
          size="sm"
          startContent={<Icon icon="lucide:search" width={18} height={18} className="text-default-400" />}
          type="search"
        />
      </div>
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          color="primary"
          onClick={onHome} // Botón para ir al inicio
          className="flex items-center gap-2"
        >
          <Icon icon="lucide:home" width={18} height={18} />
          Inicio
        </Button>
        <Switch
          size="sm"
          color="primary"
          isSelected={darkMode}
          onValueChange={setDarkMode}
          startContent={<Icon icon="lucide:sun" className="text-yellow-400" />}
          endContent={<Icon icon="lucide:moon" className="text-blue-500" />}
          aria-label="Cambiar modo oscuro"
        />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform cursor-pointer"
              color="primary"
              name={perfil?.username || "Usuario"}
              size="sm"
              src={perfil?.foto_url || undefined}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2" onClick={onProfile}>
              <p className="font-semibold">Sesión iniciada como</p>
              <p className="font-semibold">{perfil?.email || "usuario@correo.com"}</p>
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={onLogout}>
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};