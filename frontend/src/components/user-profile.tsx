import React from "react";
import { Button, Avatar, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Error404 } from "./error-404";
import { getCookie } from "../utils/cookies"; // Asegúrate de importar desde utils

type Direccion = {
  id: number;
  address: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
};

type PerfilUsuario = {
  id: number;
  username: string;
  email: string;
  rol: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  cliente?: {
    email: string;
    fecha_registro: string;
  } | null;
  direcciones: Direccion[];
  foto_url?: string | null;
};

const ROLES_ADMIN = ["ADMINISTRADOR", "EMPLEADO", "BODEGUERO", "CONTADOR"];

export const UserProfile: React.FC<{
  perfil?: PerfilUsuario;
  onGoDashboard?: () => void;
  onLogout?: () => void;
}> = ({ perfil, onGoDashboard, onLogout }) => {
  const [loggingOut, setLoggingOut] = React.useState(false);

  if (!perfil) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-danger-500">No se pudo cargar el perfil.</span>
      </div>
    );
  }

  // Lógica real de logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("http://localhost:8000/api/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      });
    } catch (e) {
      // Puedes mostrar un error si quieres
    } finally {
      setLoggingOut(false);
      if (onLogout) onLogout(); // <-- Llama siempre aquí
    }
  };

  return (
    <section className="max-w-4xl mx-auto mt-8 mb-12">
      <header className="flex flex-col sm:flex-row items-center gap-8 mb-8">
        <div className="relative flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center border-4 border-primary shadow-lg">
            {perfil.foto_url ? (
              <img
                src={perfil.foto_url}
                alt="Foto de perfil"
                className="object-cover w-full h-full"
              />
            ) : (
              <Icon icon="lucide:user" className="text-primary text-6xl" />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-4xl font-bold mb-1">{perfil.username}</h1>
          <Chip color="primary" variant="flat" className="mb-2">
            {perfil.rol ? perfil.rol : "Usuario"}
          </Chip>
          {perfil.cliente && (
            <div className="flex items-center gap-2 text-default-500 text-sm mb-2">
              <Icon icon="lucide:calendar" className="text-primary" />
              Cliente desde: {new Date(perfil.cliente.fecha_registro).toLocaleDateString()}
            </div>
          )}
          <Button
            color="danger"
            variant="flat"
            startContent={<Icon icon="lucide:log-out" />}
            className="mt-4"
            onClick={handleLogout}
            isLoading={loggingOut}
            disabled={loggingOut}
          >
            Cerrar sesión
          </Button>
        </div>
      </header>
      <Divider className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Icon icon="lucide:mail" className="text-primary" />
            Email
          </h2>
          <div className="text-default-700 mb-6">{perfil.email}</div>
        </div>
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Icon icon="lucide:map-pin" className="text-primary" />
            Direcciones
          </h2>
          <ul className="space-y-2">
            {perfil.direcciones.length === 0 && (
              <li className="text-default-400">No hay direcciones registradas.</li>
            )}
            {perfil.direcciones.map(dir => (
              <li
                key={dir.id}
                className="flex items-center gap-2 bg-default-50 dark:bg-default-100/10 rounded-lg px-3 py-2"
              >
                <Icon icon="lucide:home" className="text-default-400" />
                <span>{dir.address}</span>
                {dir.is_default && (
                  <Chip color="success" size="sm" className="ml-2">
                    Principal
                  </Chip>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {ROLES_ADMIN.includes(perfil.rol?.toUpperCase() || "") && (
        <div className="flex justify-end mt-10">
          <Button
            color="primary"
            startContent={<Icon icon="lucide:layout-dashboard" />}
            onClick={onGoDashboard}
          >
            Ir al dashboard
          </Button>
        </div>
      )}
    </section>
  );
};