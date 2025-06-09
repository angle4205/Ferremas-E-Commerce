import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  collapsed: boolean;
}

const NavItem = ({ icon, label, active = false, collapsed }: NavItemProps) => {
  return (
    <Button
      className={`justify-start ${collapsed ? "px-0 justify-center" : ""} h-12`}
      color={active ? "primary" : "default"}
      variant="flat"
      startContent={<Icon icon={icon} width={20} height={20} />}
      fullWidth
    >
      {!collapsed && <span>{label}</span>}
    </Button>
  );
};

export const Sidebar = ({ collapsed, onToggleCollapse }: SidebarProps) => {
  return (
    <div
      className={`bg-content1 border-r border-divider flex flex-col transition-all duration-300 ${
        collapsed ? "w-[70px]" : "w-[240px]"
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-divider">
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1">
            <Icon icon="lucide:tool" width={24} height={24} className="text-primary" />
            <span className="font-semibold text-lg">Gestion FERREMAS</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <Icon icon="lucide:tool" width={24} height={24} className="text-primary" />
          </div>
        )}
        <Button
          isIconOnly
          variant="light"
          className={collapsed ? "hidden" : ""}
          onPress={onToggleCollapse}
        >
          <Icon icon="lucide:chevron-left" width={18} height={18} />
        </Button>
      </div>

      <div className="flex flex-col p-2 gap-1 flex-1">
        <NavItem icon="lucide:layout-dashboard" label="Dashboard" active collapsed={collapsed} />
        <NavItem icon="lucide:shopping-bag" label="Orders" collapsed={collapsed} />
        <NavItem icon="lucide:package" label="Products" collapsed={collapsed} />
        <NavItem icon="lucide:users" label="Customers" collapsed={collapsed} />
        <NavItem icon="lucide:bar-chart" label="Analytics" collapsed={collapsed} />
        <NavItem icon="lucide:percent" label="Discounts" collapsed={collapsed} />
        <NavItem icon="lucide:truck" label="Shipping" collapsed={collapsed} />
        <NavItem icon="lucide:settings" label="Settings" collapsed={collapsed} />
      </div>

      <div className="p-2 border-t border-divider">
        {collapsed ? (
          <Button isIconOnly variant="light" onPress={onToggleCollapse}>
            <Icon icon="lucide:chevron-right" width={18} height={18} />
          </Button>
        ) : (
          <Button
            className="justify-start"
            color="default"
            variant="flat"
            startContent={<Icon icon="lucide:log-out" width={20} height={20} />}
            fullWidth
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};