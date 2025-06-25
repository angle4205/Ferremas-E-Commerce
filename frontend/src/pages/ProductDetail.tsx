import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Spinner,
  Breadcrumbs,
  BreadcrumbItem,
  Input,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { getCookie } from "../utils/cookies";

interface Producto {
  id: number;
  nombre: string;
  marca: string;
  valor: number;
  imagen_principal: string;
  categoria: string;
  descripcion?: string;
  disponible: boolean;
  rating?: number;
  descuento?: number;
  precio_con_descuento?: number;
  stock?: number;
}

function formatoCLP(valor: number) {
  return valor.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 });
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    setCargando(true);
    fetch(`http://localhost:8000/api/productos/${id}/`)
      .then(res => res.json())
      .then(data => {
        setProducto(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [id]);

  const agregarAlCarrito = async () => {
    if (!producto) return;
    setAgregando(true);
    try {
      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`http://localhost:8000/api/cart/items/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken || "",
        },
        credentials: "include",
        body: JSON.stringify({ producto_id: producto.id, cantidad }),
      });

      if (!response.ok) throw new Error();
      alert("Producto agregado al carrito");
    } catch {
      alert("No se pudo agregar el producto al carrito. Inténtalo de nuevo.");
    }
    setAgregando(false);
  };

  // Renderiza estrellas según el rating (de 0 a 5)
  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          icon={i <= Math.round(rating) ? "lucide:star" : "lucide:star-off"}
          className={`text-yellow-400 ${i <= Math.round(rating) ? "" : "opacity-40"}`}
          width={20}
          height={20}
        />
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon icon="lucide:alert-triangle" width={48} height={48} className="text-default-400" />
        <h2 className="text-xl font-semibold">Producto no encontrado</h2>
        <Button color="primary" variant="flat" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  const tieneDescuento = producto.descuento && producto.descuento > 0 && producto.precio_con_descuento;
  const imagenUrl =
    producto.imagen_principal && producto.imagen_principal.trim() !== ""
      ? producto.imagen_principal.startsWith("http")
        ? producto.imagen_principal
        : `http://localhost:8000${producto.imagen_principal}`
      : null;

  return (
    <div className="max-w-3xl mx-auto px-2 md:px-0 py-8">
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem onClick={() => navigate("/")}>Inicio</BreadcrumbItem>
        <BreadcrumbItem onClick={() => navigate("/catalogo")}>Catálogo</BreadcrumbItem>
        <BreadcrumbItem>{producto.nombre}</BreadcrumbItem>
      </Breadcrumbs>

      {/* Imagen grande y centrada */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative w-full max-w-md aspect-square bg-white dark:bg-background-dark rounded-lg flex items-center justify-center border border-default-200">
          {imagenUrl ? (
            <img
              src={imagenUrl}
              alt={producto.nombre}
              className="w-full h-full object-contain rounded-lg"
              style={{ background: "#fff" }}
            />
          ) : (
            <Icon
              icon="lucide:image"
              className="w-full h-full text-default-300"
              style={{ fontSize: 80 }}
            />
          )}
          {!producto.disponible && (
            <Chip color="danger" size="sm" className="absolute top-2 left-2 z-10">
              Sin stock
            </Chip>
          )}
          {tieneDescuento && (
            <Chip color="primary" size="sm" className="absolute top-2 right-2 z-10">
              -{producto.descuento}%
            </Chip>
          )}
        </div>
      </div>

      {/* Info principal */}
      <div className="flex flex-col gap-6">
        <div>
          <span className="block text-xs text-default-400 mb-1">{producto.marca}</span>
          <h1 className="text-3xl font-bold mb-2">{producto.nombre}</h1>
          <div className="flex items-center gap-2 mb-2">
            {renderStars(producto.rating)}
            {typeof producto.rating === "number" && (
              <span className="text-xs text-default-400">({producto.rating.toFixed(1)})</span>
            )}
          </div>
          <div className="flex items-center gap-3 mb-2">
            {tieneDescuento ? (
              <>
                <span className="font-semibold text-success-600 text-2xl">{formatoCLP(producto.precio_con_descuento!)}</span>
                <span className="line-through text-default-400 text-lg">{formatoCLP(producto.valor)}</span>
              </>
            ) : (
              <span className="font-semibold text-2xl">{formatoCLP(producto.valor)}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Chip color="secondary" size="sm">{producto.categoria}</Chip>
            {producto.stock !== undefined && (
              <span className="text-xs text-default-400">Stock: {producto.stock}</span>
            )}
          </div>
        </div>

        {/* Bloque de compra */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-gray-100 dark:bg-gray-800 rounded-lg p-4 w-full max-w-lg">
          <Input
            type="number"
            min={1}
            max={producto.stock || 99}
            value={cantidad.toString()}
            onChange={e => setCantidad(Math.max(1, Math.min(Number(e.target.value), producto.stock || 99)))}
            label="Cantidad"
            className="w-28"
            disabled={!producto.disponible}
          />
          <Button
            color="primary"
            size="lg"
            startContent={<Icon icon="lucide:shopping-cart" />}
            disabled={!producto.disponible || agregando}
            onClick={agregarAlCarrito}
          >
            {producto.disponible ? "Agregar al carrito" : "Sin stock"}
          </Button>
        </div>

        {/* Descripción */}
        <div>
          <h2 className="font-semibold mb-1">Descripción</h2>
          <p className="text-default-600 text-base">
            {producto.descripcion || "Sin descripción disponible."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;