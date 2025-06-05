import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link, Input, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FeaturedCategories } from "./components/featured-categories";
import { HeroSection } from "./components/hero-section";
import { PopularProducts } from "./components/popular-products";
import { PromoBanner } from "./components/promo-banner";
import { ServiceFeatures } from "./components/service-features";
import { Footer } from "./components/footer";
import { CatalogPage } from "./components/catalog-page";

export default function App() {
  // Estado para la página actual
  const [currentPage, setCurrentPage] = React.useState("inicio");
  
  // Función para cambiar de página
  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Barra de navegación */}
      <Navbar maxWidth="xl" isBordered className="bg-background">
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
            <Button isIconOnly variant="light" radius="full">
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
        {currentPage === "inicio" ? (
          <>
            {/* Sección principal */}
            <HeroSection />
            
            {/* Categorías destacadas */}
            <FeaturedCategories />
            
            {/* Productos populares */}
            <PopularProducts />
            
            {/* Banner promocional */}
            <PromoBanner />
            
            {/* Características de servicio */}
            <ServiceFeatures />
          </>
        ) : currentPage === "catalogo" ? (
          <CatalogPage />
        ) : null}
      </main>
      
      {/* Pie de página */}
      <Footer navigateTo={navigateTo} />
    </div>
  );
}