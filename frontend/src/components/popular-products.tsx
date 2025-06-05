import React from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Producto {
  id: number;
  nombre: string;
  marca: string;
  valor: number;
  originalPrice?: number;
  imagen_principal: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  categoria: string;
}

const ProductCard: React.FC<{ producto: Producto }> = ({ producto }) => (
  <Card className="w-full" isPressable disableRipple>
    <CardBody className="p-0 overflow-hidden">
      <div className="relative">
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
        <img
          src={
            producto.imagen_principal.startsWith("http")
              ? producto.imagen_principal
              : `http://localhost:8000${producto.imagen_principal}`
          }
          alt={producto.nombre}
          className="w-full aspect-square object-contain bg-white"
        />
      </div>
      <div className="p-4">
        <span className="block text-xs text-default-400 mb-1">{producto.marca}</span>
        <h3 className="font-medium text-foreground/90 line-clamp-1">{producto.nombre}</h3>
        <div className="flex items-center gap-2 mt-2">
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

export const PopularProducts: React.FC = () => {
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [cargando, setCargando] = React.useState(true);

  React.useEffect(() => {
    setCargando(true);
    fetch("http://localhost:8000/api/productos/")
      .then(res => res.json())
      .then(data => {
        setProductos(
          data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            marca: item.marca,
            valor: Number(item.valor),
            originalPrice: undefined,
            imagen_principal: item.imagen_principal,
            isNew: false,
            isBestSeller: false,
            categoria: item.categoria,
          }))
        );
        setCargando(false);
      });
  }, []);

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Productos populares</h2>
        <Button
          variant="light"
          color="primary"
          endContent={<Icon icon="lucide:arrow-right" />}
        >
          Ver todos
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.slice(0, 8).map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  );
};