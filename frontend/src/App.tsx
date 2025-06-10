import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Link,
  Badge,
  Switch,
  Spinner,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import FeaturedCategories from "./components/FeaturedCategories";
import HeroSection from "./components/HeroSection";
import PopularProducts from "./components/PopularProducts";
import PromoBanner from "./components/PromoBanner";
import ServiceFeatures from "./components/ServiceFeatures";
import Footer from "./components/Footer";
import CatalogPage from "./pages/CatalogPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CartModal from "./components/CartModal";
import { Icon } from "@iconify/react/dist/iconify.js";

type PerfilUsuario = {
  id: number;
  username: string;
  email: string;
  rol: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  foto_url?: string | null;
  cliente?: {
    email: string;
    fecha_registro: string;
  } | null;
  direcciones: any[];
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("inicio");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const [cartItems, setCartItems] = useState<number>(0);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [perfilLoading, setPerfilLoading] = useState(true);
  const [authPage, setAuthPage] = useState<null | "login" | "register" | "profile">(null);

  useEffect(() => {
    setPerfilLoading(true);
    fetch("http://localhost:8000/api/usuario/perfil/", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setPerfil(data);
        setPerfilLoading(false);
      })
      .catch(() => {
        setPerfil(null);
        setPerfilLoading(false);
      });
  }, []);

  // Nueva función para actualizar el contador del carrito
  const fetchCartCount = () => {
    fetch("http://localhost:8000/api/cart/", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setCartItems(data.items.length))
      .catch(() => setCartItems(0));
  };

  // Actualiza el contador al montar
  useEffect(() => {
    fetchCartCount();
  }, []);

  const handleLoginSuccess = () => {
    fetch("http://localhost:8000/api/usuario/perfil/", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPerfil(data))
      .catch(() => setPerfil(null));
    setAuthPage(null);
  };

  const handleRegisterSuccess = () => {
    setAuthPage("login");
  };

  const [catalogoCategoria, setCatalogoCategoria] = useState<string | null>(null);

  const navigateTo = (page: string, categoria?: string) => {
    setAuthPage(null);
    setCurrentPage(page);
    if (page === "catalogo") {
      setCatalogoCategoria(categoria ?? null);
    }
  };

  const isDashboard = currentPage === "dashboard";

  // --- Búsqueda Navbar refactorizada ---
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    { type: "producto" | "marca" | "categoria"; label: string; id?: number; key?: string }[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);

    Promise.all([
      fetch(`http://localhost:8000/api/productos/?search=${encodeURIComponent(searchTerm)}`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => (Array.isArray(data) ? data : data.results || [])),
      fetch(`http://localhost:8000/api/categorias/?search=${encodeURIComponent(searchTerm)}`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => (Array.isArray(data) ? data : data.results || [])),
    ])
      .then(([productos, categorias]) => {
        const marcasSet = new Set<string>();
        productos.forEach((p: any) => {
          if (p.marca) marcasSet.add(p.marca);
        });

        // Marcas que matchean el término de búsqueda (case-insensitive), exactas primero
        const marcasFiltradas = Array.from(marcasSet)
          .filter((marca) => marca.toLowerCase().includes(searchTerm.trim().toLowerCase()))
          .sort((a, b) => {
            const term = searchTerm.trim().toLowerCase();
            if (a.toLowerCase() === term && b.toLowerCase() !== term) return -1;
            if (a.toLowerCase() !== term && b.toLowerCase() === term) return 1;
            return a.localeCompare(b);
          });

        // Categorías que matchean el término de búsqueda
        const categoriasFiltradas = categorias.slice(0, 3);

        // Productos que matchean el término de búsqueda
        const productosFiltrados = productos.slice(0, 5);

        // Orden: marcas, categorías, productos
        const results: { type: "producto" | "marca" | "categoria"; label: string; id?: number; key?: string }[] = [];

        marcasFiltradas.slice(0, 3).forEach((marca) => {
          results.push({ type: "marca", label: `${marca}.. en Marcas` });
        });

        categoriasFiltradas.forEach((c: any) =>
          results.push({ type: "categoria", label: `${c.nombre}.. en Categorias`, id: c.id })
        );

        productosFiltrados.forEach((p: any) => {
          results.push({ type: "producto", label: `${p.nombre}.. en Productos`, id: p.id });
        });

        setSearchResults(results.map((item, idx) => ({ ...item, key: idx.toString() })));
      })
      .finally(() => setSearchLoading(false));
  }, [searchTerm]);

  const handleSearchSelect = (item: { type: string; label: string; id?: number }) => {
    setSearchTerm("");
    if (item.type === "producto") {
      navigateTo("catalogo");
      // TODO: Puedes guardar el id en un estado global o navegar a un detalle
    } else if (item.type === "categoria") {
      navigateTo("catalogo", item.label.split("..")[0]);
    }
    // TODO: Si quieres filtrar por marca, puedes implementar lógica aquí
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      {currentPage === "dashboard" ? (
        !perfil ? (
          <div className="flex justify-center items-center min-h-screen">
            <Spinner size="lg" />
          </div>
        ) : (
          <AdminDashboardPage
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            perfil={{
              username: perfil.username,
              email: perfil.email,
              foto_url: perfil.foto_url ?? null,
            }}
            onProfile={() => {
              setCurrentPage("inicio");
              setAuthPage("profile");
            }}
            onLogout={() => {
              setPerfil(null);
              setCurrentPage("inicio");
              setAuthPage("login");
            }}
            onHome={() => navigateTo("inicio")}
          />
        )
      ) : (
        <>
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
            <NavbarContent justify="end" className="gap-4">
              <NavbarItem className="hidden sm:flex" style={{ minWidth: 0, flex: 1 }}>
                <div className="w-full" style={{ minWidth: 240, maxWidth: 380 }}>
                  <Autocomplete
                    classNames={{
                      base: "w-full",
                      inputWrapper: "h-10 font-normal text-default-500 bg-default-100",
                      input: "pl-9",
                    }}
                    placeholder="Buscar productos, marcas, categorías..."
                    size="sm"
                    startContent={<Icon icon="lucide:search" width={18} height={18} />}
                    inputValue={searchTerm}
                    onInputChange={setSearchTerm}
                    isLoading={searchLoading}
                    onSelectionChange={(key) => {
                      const item = searchResults.find((i) => i.key === key);
                      if (item) handleSearchSelect(item);
                    }}
                    aria-label="Buscar"
                    items={searchResults}
                    noResultsContent={<span className="p-4 text-default-400">Sin resultados</span>}
                    loadingContent={<span className="p-4 text-default-400">Buscando...</span>}
                  >
                    {(item) => {
                      // Separar nombre y contexto (.. en ...)
                      const [nombre, contexto] = item.label.split("..");
                      let icon = null;
                      if (item.type === "producto") icon = <Icon icon="lucide:box" className="mr-2 text-primary" />;
                      if (item.type === "marca") icon = <Icon icon="lucide:star" className="mr-2 text-yellow-500" />;
                      if (item.type === "categoria") icon = <Icon icon="lucide:layers" className="mr-2 text-blue-500" />;
                      return (
                        <AutocompleteItem key={item.key} textValue={item.label}>
                          <div className="flex items-center">
                            {icon}
                            <span className="font-medium">{nombre?.trim()}</span>
                            {contexto && (
                              <span className="ml-2 text-xs text-default-400">{contexto.trim()}</span>
                            )}
                          </div>
                        </AutocompleteItem>
                      );
                    }}
                  </Autocomplete>
                </div>
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
                  <Icon icon="lucide:user" className="text-default-500" width={20} height={20} />
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Badge content={cartItems} color="primary">
                  <Button
                    isIconOnly
                    variant="light"
                    radius="full"
                    onClick={() => setIsCartModalOpen(true)}
                  >
                    <Icon icon="lucide:shopping-cart" className="text-default-500" width={20} height={20} />
                  </Button>
                </Badge>
              </NavbarItem>
            </NavbarContent>
          </Navbar>

          <main className="container mx-auto px-4 py-4">
            {authPage === "login" ? (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onShowRegister={() => setAuthPage("register")}
              />
            ) : authPage === "register" ? (
              <RegisterPage
                onRegisterSuccess={handleRegisterSuccess}
                onShowLogin={() => setAuthPage("login")}
              />
              ) : authPage === "profile" ? (
              perfilLoading ? (
                <div className="flex justify-center items-center min-h-[40vh]">
                  <Spinner size="lg" />
                </div>
              ) : (
                <ProfilePage
                  perfil={perfil ?? undefined}
                  onGoDashboard={() => {
                    setAuthPage(null);
                    setCurrentPage("dashboard");
                  }}
                  onLogout={() => {
                    setPerfil(null);
                    setCurrentPage("inicio");
                    setAuthPage("login");
                  }}
                />
              )
            ) : currentPage === "inicio" ? (
                <>
                  <HeroSection />
                  <FeaturedCategories navigateTo={navigateTo} />
                  <PopularProducts navigateTo={navigateTo} />
                  <PromoBanner />
                  <ServiceFeatures />
                </>
            ) : currentPage === "catalogo" ? (
                <CatalogPage categoriaInicial={catalogoCategoria} />
            ) : null}
          </main>
          <Footer navigateTo={navigateTo} />

          <CartModal
            isOpen={isCartModalOpen}
            onClose={() => {
              setIsCartModalOpen(false);
              fetchCartCount();
            }}
            onCheckout={() => {
              setIsCartModalOpen(false);
              fetchCartCount();
              navigateTo("checkout");
            }}
            key={isCartModalOpen ? "open" : "closed"}
          />
        </>
      )}
    </div>
  );
}