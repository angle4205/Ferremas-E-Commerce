import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Link,
  Input,
  Badge,
  Switch,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { FeaturedCategories } from "./components/featured-categories";
import { HeroSection } from "./components/hero-section";
import { PopularProducts } from "./components/popular-products";
import { PromoBanner } from "./components/promo-banner";
import { ServiceFeatures } from "./components/service-features";
import { Footer } from "./components/footer";
import { CatalogPage } from "./components/catalog-page";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { UserProfile } from "./components/user-profile";

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
  direcciones: any[];
};

export default function App() {
  const [currentPage, setCurrentPage] = React.useState("inicio");
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  React.useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // Estado real de usuario autenticado
  const [perfil, setPerfil] = React.useState<PerfilUsuario | null>(null);
  const [perfilLoading, setPerfilLoading] = React.useState(true);
  const [authPage, setAuthPage] = React.useState<null | "login" | "register" | "profile">(null);

  // Al cargar la app, intenta obtener el perfil (mantener sesión tras F5)
  React.useEffect(() => {
    setPerfilLoading(true);
    fetch("http://localhost:8000/api/usuario/perfil/", { credentials: "include" })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        setPerfil(data);
        setPerfilLoading(false);
      })
      .catch(() => {
        setPerfil(null);
        setPerfilLoading(false);
      });
  }, []);

  // Cuando el login es exitoso
  const handleLoginSuccess = () => {
    fetch("http://localhost:8000/api/usuario/perfil/", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => setPerfil(data))
      .catch(() => setPerfil(null));
    setAuthPage(null);
  };

  // Cuando el registro es exitoso
  const handleRegisterSuccess = () => {
    setAuthPage("login");
  };

  const navigateTo = (page: string) => {
    setAuthPage(null);
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      {/* Barra de navegación */}
      <Navbar maxWidth="xl" isBordered className="bg-background dark:bg-background-dark">
        <NavbarBrand>
          <Icon icon="lucide:hammer" className="text-primary text-2xl" />
          <p className="font-bold text-inherit ml-2">FERREMAS+</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={currentPage === "inicio"}>
            <Link
              color={currentPage === "inicio" ? "primary" : "foreground"}
              href="#"
              onClick={() => navigateTo("inicio")}
            >
              Inicio
            </Link>
          </NavbarItem>
          <NavbarItem isActive={currentPage === "catalogo"}>
            <Link
              color={currentPage === "catalogo" ? "primary" : "foreground"}
              href="#"
              onClick={() => navigateTo("catalogo")}
            >
              Catálogo
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden sm:flex">
            <Input
              classNames={{
                base: "max-w-full sm:max-w-[18rem] h-10",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper: "h-full font-normal text-default-500 bg-default-100",
              }}
              placeholder="Buscar productos..."
              size="sm"
              startContent={<Icon icon="lucide:search" size={18} />}
              type="search"
            />
          </NavbarItem>
          <NavbarItem>
            <Switch
              size="sm"
              color="primary"
              isSelected={darkMode}
              onValueChange={setDarkMode}
              startContent={<Icon icon="lucide:sun" className="text-yellow-400" />}
              endContent={<Icon icon="lucide:moon" className="text-blue-500" />}
              aria-label="Cambiar modo oscuro"
            />
          </NavbarItem>
          <NavbarItem>
            <Button
              isIconOnly
              variant="light"
              radius="full"
              onClick={() => {
                if (perfil) setAuthPage("profile");
                else setAuthPage("login");
              }}
            >
              <Icon icon="lucide:user" className="text-default-500" size={20} />
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Badge content="3" color="primary">
              <Button isIconOnly variant="light" radius="full">
                <Icon icon="lucide:shopping-cart" className="text-default-500" size={20} />
              </Button>
            </Badge>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto px-4 py-4">
        {/* Página de login, registro o perfil */}
        {authPage === "login" ? (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onShowRegister={() => setAuthPage("register")}
          />
        ) : authPage === "register" ? (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onShowLogin={() => setAuthPage("login")}
          />
        ) : authPage === "profile" ? (
          perfilLoading ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <Spinner size="lg" />
            </div>
          ) : (
            <UserProfile
              perfil={perfil ?? undefined}
              onGoDashboard={() => {
                setAuthPage(null);
                setCurrentPage("dashboard");
              }}
            />
          )
        ) : currentPage === "inicio" ? (
          <>
            <HeroSection />
            <FeaturedCategories />
            <PopularProducts />
            <PromoBanner />
            <ServiceFeatures />
          </>
        ) : currentPage === "catalogo" ? (
          <CatalogPage />
        ) : null}
      </main>

      <Footer navigateTo={navigateTo} />
    </div>
  );
}