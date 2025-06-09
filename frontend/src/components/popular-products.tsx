import React from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Producto {
  id: number;
  nombre: string;
  marca: string;
  valor: number;
  originalPrice?: number;
  imagen_principal: string | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  categoria: string;
  rating?: number;
}

const API_URL = "http://localhost:8000";

const renderStars = (rating: number = 0) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Icon
        key={i}
        icon={i <= Math.round(rating) ? "lucide:star" : "lucide:star-off"}
        className={`text-yellow-400 ${i <= Math.round(rating) ? "" : "opacity-40"}`}
        width={18}
        height={18}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const ProductCard: React.FC<{ producto: Producto }> = ({ producto }) => {
  let imagenUrl: string | null = null;
  if (producto.imagen_principal && typeof producto.imagen_principal === "string" && producto.imagen_principal.trim() !== "") {
    imagenUrl = producto.imagen_principal.startsWith("http")
      ? producto.imagen_principal
      : `${API_URL}${producto.imagen_principal}`;
  }

  return (
    <Card className="w-full" isPressable disableRipple>
      <CardBody className="p-0 overflow-hidden">
        <div className="relative w-full aspect-square bg-white flex items-center justify-center" style={{ minHeight: 0, height: 0, paddingBottom: "100%" }}>
          {producto.isNew && (
            <Chip
              color="primary"
              variant="flat"
              size="sm"
              className="absolute top-2 left-2 z-10"
            >
              Nuevo
            </Chip>
          )}
          {producto.isBestSeller && (
            <Chip
              color="warning"
              variant="flat"
              size="sm"
              className="absolute top-2 left-2 z-10"
            >
              Más vendido
            </Chip>
          )}
          {imagenUrl ? (
            <img
              src={imagenUrl}
              alt={producto.nombre}
              className="absolute top-0 left-0 w-full h-full object-contain bg-white"
            />
          ) : (
            <Icon
              icon="lucide:image"
              className="absolute top-0 left-0 w-full h-full text-default-300"
              style={{ fontSize: 64 }}
            />
          )}
        </div>
        <div className="p-4">
          <span className="block text-xs text-default-400 mb-1">{producto.marca}</span>
          <h3 className="font-medium text-foreground/90 line-clamp-1">{producto.nombre}</h3>
          <div className="flex items-center gap-2 mt-2 mb-1">
            {renderStars(producto.rating)}
            {typeof producto.rating === "number" && (
              <span className="text-xs text-default-400">({producto.rating.toFixed(1)})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">${producto.valor.toLocaleString("es-CL")}</span>
            {producto.originalPrice && (
              <span className="text-default-500 text-sm line-through">
                ${producto.originalPrice.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button
          fullWidth
          color="primary"
          variant="flat"
          startContent={<Icon icon="lucide:shopping-cart" size={18} />}
        >
          Agregar al carrito
        </Button>
      </CardFooter>
    </Card>
  );
};

export const PopularProducts: React.FC<{ navigateTo?: (page: string, categoria?: string) => void }> = ({ navigateTo }) => {
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [cargando, setCargando] = React.useState(true);

  React.useEffect(() => {
    setCargando(true);
    fetch(`${API_URL}/api/productos/`)
      .then(res => res.json())
      .then(data => {
        setProductos(
          data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            marca: typeof item.marca === "string" ? item.marca : (item.marca?.nombre ?? "Sin marca"),
            valor: Number(item.valor),
            originalPrice: undefined,
            imagen_principal: item.imagen_principal ?? null,
            isNew: false,
            isBestSeller: false,
            categoria: typeof item.categoria === "string" ? item.categoria : (item.categoria?.nombre ?? "Sin categoría"),
            rating: typeof item.rating === "number" ? item.rating : Math.random() * 2 + 3,
          }))
        );
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  // Ordenar por rating descendente y tomar los 4 mejores
  const productosPopulares = [...productos]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Productos populares</h2>
        <Button
          variant="light"
          color="primary"
          endContent={<Icon icon="lucide:arrow-right" />}
          onClick={() => navigateTo && navigateTo("catalogo")}
        >
          Ver todos
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {productosPopulares.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
      {cargando && <div className="text-center py-8">Cargando...</div>}
    </section>
  );
};