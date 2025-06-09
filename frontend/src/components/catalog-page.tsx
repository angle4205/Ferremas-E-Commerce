import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Breadcrumbs,
  BreadcrumbItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface Producto {
  id: number;
  nombre: string;
  marca: string;
  valor: number;
  imagen_principal: string;
  categoria: string;
  disponible: boolean;
  rating?: number;
}

interface EstadoFiltros {
  categoria: string;
  rangoPrecio: string;
  ordenarPor: string;
  busqueda: string;
}

function formatoCLP(valor: number) {
  return valor.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 });
}

// Función para agregar un producto al carrito
const agregarAlCarrito = async (productoId: number) => {
  try {
    const response = await fetch(`http://localhost:8000/api/cart/items/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Incluye cookies para autenticación
      body: JSON.stringify({ producto_id: productoId, cantidad: 1 }),
    });

    if (!response.ok) {
      throw new Error("Error al agregar el producto al carrito");
    }

    const data = await response.json();
    console.log("Producto agregado al carrito:", data);
    alert("Producto agregado al carrito");
  } catch (error) {
    console.error(error);
    alert("No se pudo agregar el producto al carrito. Inténtalo de nuevo.");
  }
};

const TarjetaProducto: React.FC<{ producto: Producto }> = ({ producto }) => {
  let imagenUrl: string | null = null;
  if (producto.imagen_principal && typeof producto.imagen_principal === "string" && producto.imagen_principal.trim() !== "") {
    imagenUrl = producto.imagen_principal.startsWith("http")
      ? producto.imagen_principal
      : `http://localhost:8000${producto.imagen_principal}`;
  }

  // Renderiza estrellas según el rating (de 0 a 5)
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

  return (
    <Card className="w-full" isPressable disableRipple>
      <CardBody className="p-0 overflow-hidden">
        <div
          className="relative w-full aspect-square bg-white flex items-center justify-center"
          style={{ minHeight: 0, height: 0, paddingBottom: "100%" }}
        >
          {imagenUrl ? (
            <img
              src={imagenUrl}
              alt={producto.nombre}
              className="absolute top-0 left-0 w-full h-full object-contain"
              style={{ background: "#fff" }}
            />
          ) : (
            <Icon
              icon="lucide:image"
              className="absolute top-0 left-0 w-full h-full text-default-300"
              style={{ fontSize: 64 }}
            />
          )}
          {!producto.disponible && (
            <Chip color="danger" size="sm" className="absolute top-2 left-2 z-10">
              Sin stock
            </Chip>
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
            <span className="font-semibold">{formatoCLP(producto.valor)}</span>
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button
          fullWidth
          color="primary"
          variant="flat"
          startContent={<Icon icon="lucide:shopping-cart" size={18} />}
          disabled={!producto.disponible}
          onClick={() => agregarAlCarrito(producto.id)} // Llama a la función al hacer clic
        >
          Agregar al carrito
        </Button>
      </CardFooter>
    </Card>
  );
};

// Cambia aquí: acepta categoriaInicial como prop
export const CatalogPage: React.FC<{ categoriaInicial?: string | null }> = ({ categoriaInicial }) => {
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [cargando, setCargando] = React.useState(true);

  // Usa categoriaInicial para el filtro inicial
  const [filtros, setFiltros] = React.useState<EstadoFiltros>({
    categoria: categoriaInicial || "todos",
    rangoPrecio: "todos",
    ordenarPor: "populares",
    busqueda: "",
  });
  const [paginaActual, setPaginaActual] = React.useState(1);
  const productosPorPagina = 12;

  // Si cambia la prop, actualiza el filtro de categoría
  React.useEffect(() => {
    if (categoriaInicial && categoriaInicial !== filtros.categoria) {
      setFiltros(f => ({ ...f, categoria: categoriaInicial }));
      setPaginaActual(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaInicial]);

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
            imagen_principal: item.imagen_principal,
            categoria: item.categoria,
            disponible: !!item.disponible,
            rating: typeof item.rating === "number" ? item.rating : Math.random() * 2 + 3,
          }))
        );
        setCargando(false);
      });
  }, []);

  // Extraer categorías únicas del catálogo para el filtro
  const categoriasUnicas = React.useMemo(() => {
    const cats = Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)));
    return [{ key: "todos", label: "Todas las categorías" }, ...cats.map(c => ({ key: c, label: c }))];
  }, [productos]);

  const opcionesPrecio = [
    { key: "todos", label: "Todos los precios" },
    { key: "menos25", label: "Menos de $25.000" },
    { key: "25a50", label: "$25.000 - $50.000" },
    { key: "50a100", label: "$50.000 - $100.000" },
    { key: "mas100", label: "Más de $100.000" }
  ];

  const opcionesOrden = [
    { key: "populares", label: "Más populares" },
    { key: "nuevos", label: "Más nuevos" },
    { key: "precioAsc", label: "Precio: menor a mayor" },
    { key: "precioDesc", label: "Precio: mayor a menor" }
  ];

  const cambiarFiltro = (tipo: keyof EstadoFiltros, valor: string) => {
    setFiltros(prev => ({ ...prev, [tipo]: valor }));
    setPaginaActual(1);
  };

  const cambiarBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros(prev => ({ ...prev, busqueda: e.target.value }));
    setPaginaActual(1);
  };

  // Filtrado y ordenamiento
  const productosFiltrados = React.useMemo(() => {
    let resultado = [...productos];

    if (filtros.categoria !== "todos") {
      resultado = resultado.filter(p => p.categoria === filtros.categoria);
    }

    switch (filtros.rangoPrecio) {
      case "menos25":
        resultado = resultado.filter(p => p.valor < 25000);
        break;
      case "25a50":
        resultado = resultado.filter(p => p.valor >= 25000 && p.valor <= 50000);
        break;
      case "50a100":
        resultado = resultado.filter(p => p.valor > 50000 && p.valor <= 100000);
        break;
      case "mas100":
        resultado = resultado.filter(p => p.valor > 100000);
        break;
      default:
        break;
    }

    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        p =>
          p.nombre.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q)
      );
    }

    switch (filtros.ordenarPor) {
      case "precioAsc":
        resultado.sort((a, b) => a.valor - b.valor);
        break;
      case "precioDesc":
        resultado.sort((a, b) => b.valor - a.valor);
        break;
      case "nuevos":
        resultado.sort((a, b) => b.id - a.id);
        break;
      default:
        // populares: podrías implementar lógica de popularidad si la tienes
        break;
    }

    return resultado;
  }, [filtros, productos]);

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosActuales = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  const categoriaActual = categoriasUnicas.find(cat => cat.key === filtros.categoria)?.label || "Todas las categorías";

  return (
    <div className="mb-16">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Catálogo</BreadcrumbItem>
        <BreadcrumbItem>{categoriaActual}</BreadcrumbItem>
      </Breadcrumbs>

      <h1 className="text-3xl font-bold mb-8">Catálogo de productos</h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Buscar productos..."
            value={filtros.busqueda}
            onChange={cambiarBusqueda}
            startContent={<Icon icon="lucide:search" size={18} />}
            clearable
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={<Icon icon="lucide:chevron-down" size={16} />}
              >
                {categoriaActual}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Categorías"
              selectionMode="single"
              selectedKeys={[filtros.categoria]}
              onSelectionChange={keys => {
                const seleccionado = Array.from(keys)[0]?.toString() || "todos";
                cambiarFiltro("categoria", seleccionado);
              }}
            >
              {categoriasUnicas.map(cat => (
                <DropdownItem key={cat.key}>{cat.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={<Icon icon="lucide:chevron-down" size={16} />}
              >
                {opcionesPrecio.find(p => p.key === filtros.rangoPrecio)?.label || "Todos los precios"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Rango de precio"
              selectionMode="single"
              selectedKeys={[filtros.rangoPrecio]}
              onSelectionChange={keys => {
                const seleccionado = Array.from(keys)[0]?.toString() || "todos";
                cambiarFiltro("rangoPrecio", seleccionado);
              }}
            >
              {opcionesPrecio.map(p => (
                <DropdownItem key={p.key}>{p.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={<Icon icon="lucide:chevron-down" size={16} />}
              >
                {opcionesOrden.find(o => o.key === filtros.ordenarPor)?.label || "Ordenar"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Ordenar por"
              selectionMode="single"
              selectedKeys={[filtros.ordenarPor]}
              onSelectionChange={keys => {
                const seleccionado = Array.from(keys)[0]?.toString() || "populares";
                cambiarFiltro("ordenarPor", seleccionado);
              }}
            >
              {opcionesOrden.map(o => (
                <DropdownItem key={o.key}>{o.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-default-500">
          Mostrando {productosFiltrados.length > 0 ? (paginaActual - 1) * productosPorPagina + 1 : 0}-
          {Math.min(paginaActual * productosPorPagina, productosFiltrados.length)} de {productosFiltrados.length} productos
        </p>
        {productosFiltrados.length > productosPorPagina && (
          <div className="hidden md:block">
            <Pagination
              total={totalPaginas}
              page={paginaActual}
              onChange={setPaginaActual}
              showControls
            />
          </div>
        )}
      </div>

      {/* Grid de productos */}
      {productosActuales.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {productosActuales.map(producto => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </div>
      ) : (
        <Card className="w-full p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Icon icon="lucide:search-x" size={48} className="text-default-400" />
            <h3 className="text-xl font-semibold">No se encontraron productos</h3>
            <p className="text-default-500">
              Intenta ajustar tu búsqueda o los filtros seleccionados.
            </p>
            <Button
              color="primary"
              variant="flat"
              onClick={() =>
                setFiltros({
                  categoria: "todos",
                  rangoPrecio: "todos",
                  ordenarPor: "populares",
                  busqueda: "",
                })
              }
            >
              Limpiar filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Paginación inferior */}
      {productosFiltrados.length > productosPorPagina && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalPaginas}
            page={paginaActual}
            onChange={setPaginaActual}
            showControls
          />
        </div>
      )}
    </div>
  );
};