import React from "react";
import { Link, Divider, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface FooterProps {
  navigateTo?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  return (
    <footer className="bg-content2 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* FERREMAS Info */}
          <div>
            <div className="flex items-center mb-4">
              <Icon icon="mdi:tools" className="text-primary text-2xl" />
              <span className="font-bold text-xl ml-2">FERREMAS</span>
            </div>
            <p className="text-default-600 mb-4">
              FERREMAS es una distribuidora líder en productos de ferretería y construcción en Chile,
              con más de 40 años de trayectoria. Contamos con 7 sucursales y una tienda en línea
              para ofrecerte la mejor experiencia de compra.
            </p>
            <div className="flex gap-4">
              <Button isIconOnly variant="flat" size="sm" radius="full">
                <a href="#" aria-label="Facebook">
                  <Icon icon="mdi:facebook" style={{ fontSize: 20 }} />
                </a>
              </Button>
              <Button isIconOnly variant="flat" size="sm" radius="full">
                <a href="#" aria-label="Instagram">
                  <Icon icon="mdi:instagram" style={{ fontSize: 20 }} />
                </a>
              </Button>
              <Button isIconOnly variant="flat" size="sm" radius="full">
                <a href="#" aria-label="Twitter">
                  <Icon icon="mdi:twitter" style={{ fontSize: 20 }} />
                </a>
              </Button>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link color="foreground" href="/">Inicio</Link>
              </li>
              <li>
                {navigateTo ? (
                  <Link as="button" color="foreground" onClick={() => navigateTo("catalogo")} className="cursor-pointer">
                    Catálogo
                  </Link>
                ) : (
                  <Link color="foreground" href="/catalogo">
                    Catálogo
                  </Link>
                )}
              </li>
              <li>
                <Link color="foreground" href="/terminos-y-condiciones">Términos y condiciones</Link>
              </li>
              <li>
                <Link color="foreground" href="/contacto">Contáctanos</Link>
              </li>
            </ul>
          </div>

          {/* Espacio para futuras secciones o sucursales */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Sucursales</h3>
            <p className="text-default-600 mb-2">7 sucursales a lo largo de Chile.</p>
            <p className="text-default-600 text-sm">¡Visítanos o compra online!</p>
          </div>

          {/* Newsletter o contacto rápido */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <p className="text-default-600 mb-2">
              ¿Tienes dudas? Escríbenos y te ayudaremos.
            </p>
            <Link color="primary" href="/contacto" className="font-semibold">
              Ir a formulario de contacto
            </Link>
          </div>
        </div>

        <Divider className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-default-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} FERREMAS. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-sm">
            <Link color="foreground" href="/privacidad" size="sm">Política de privacidad</Link>
            <Link color="foreground" href="/terminos-y-condiciones" size="sm">Términos y condiciones</Link>
            <Link color="foreground" href="/accesibilidad" size="sm">Accesibilidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;