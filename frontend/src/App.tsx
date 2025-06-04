import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link, Input, Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Card, CardBody, Image } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FeaturedCategories } from "./components/featured-categories";
import { HeroSection } from "./components/hero-section";
import { PopularProducts } from "./components/popular-products";
import { PromoBanner } from "./components/promo-banner";
import { ServiceFeatures } from "./components/service-features";
import { Footer } from "./components/footer";
import { CatalogPage } from "./components/catalog-page";

export default function App() {
  // Add state to track current page
  const [currentPage, setCurrentPage] = React.useState("home");
  
  // Function to handle page navigation
  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar maxWidth="xl" isBordered className="bg-background">
        <NavbarBrand>
          <Icon icon="lucide:hammer" className="text-primary text-2xl" />
          <p className="font-bold text-inherit ml-2">FERREMAS+</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={currentPage === "home"}>
            <Link 
              color={currentPage === "home" ? "primary" : "foreground"} 
              href="#"
              onClick={() => navigateTo("home")}
            >
              Home
            </Link>
          </NavbarItem>
          <NavbarItem isActive={currentPage === "catalog"}>
            <Link 
              color={currentPage === "catalog" ? "primary" : "foreground"} 
              href="#"
              onClick={() => navigateTo("catalog")}
            >
              Catalog
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Deals
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Services
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
              placeholder="Search for products..."
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
        {currentPage === "home" ? (
          <>
            {/* Hero Section */}
            <HeroSection />
            
            {/* Featured Categories */}
            <FeaturedCategories />
            
            {/* Popular Products */}
            <PopularProducts />
            
            {/* Promo Banner */}
            <PromoBanner />
            
            {/* Service Features */}
            <ServiceFeatures />
          </>
        ) : currentPage === "catalog" ? (
          <CatalogPage />
        ) : null}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}