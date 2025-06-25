import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Spinner,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { getCookie } from "../../utils/cookies";

interface Producto {
  id: number;
  nombre: string;
  valor: number;
  categoria: string;
  marca: string;
  descuento?: number;
  precio_con_descuento?: number;
}

const formatoCLP = (valor: number) =>
  valor
    .toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: "symbol",
    })
    .replace("CLP", "CLP")
    .replace("$", "$ ");

const DiscountsPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [descuento, setDescuento] = useState<string>("");
  const [aplicando, setAplicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroDescuento, setFiltroDescuento] = useState("");

  const marcas = Array.from(new Set(productos.map((p) => p.marca))).sort();
  const categorias = Array.from(new Set(productos.map((p) => p.categoria))).sort();

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/productos/", { credentials: "include" });
      const data = await res.json();
      setProductos(data);
    } catch {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSelect = (id: number) => {
    setSelected((sel) => (sel.includes(id) ? sel.filter((i) => i !== id) : [...sel, id]));
  };

  const handleApplyDiscount = async () => {
    setError(null);
    setSuccess(null);
    const pct = parseFloat(descuento);
    if (isNaN(pct) || pct <= 0 || pct >= 100) {
      setError("Ingresa un porcentaje válido (1-99)");
      return;
    }
    if (selected.length === 0) {
      setError("Selecciona al menos un producto");
      return;
    }
    setAplicando(true);
    try {
      const csrfToken = getCookie("csrftoken");
      const res = await fetch("http://localhost:8000/api/admin/discounts/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ productos: selected, descuento: pct }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.mensaje || "Error al aplicar el descuento.");
      } else {
        setSuccess("¡Descuento aplicado!");
        setSelected([]);
        setDescuento("");
        await fetchProductos();
      }
    } catch {
      setError("Error al aplicar el descuento.");
    } finally {
      setAplicando(false);
    }
  };

  // Filtro de productos
  const productosFiltrados = productos.filter((prod) => {
    const nombreOk = prod.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const marcaOk = !filtroMarca || prod.marca === filtroMarca;
    const categoriaOk = !filtroCategoria || prod.categoria === filtroCategoria;
    const descuentoOk =
      filtroDescuento === ""
        ? true
        : filtroDescuento === "con"
        ? !!prod.descuento && prod.descuento > 0
        : !prod.descuento || prod.descuento === 0;
    return nombreOk && marcaOk && categoriaOk && descuentoOk;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-8">
      <Card>
        <CardHeader className="flex items-center gap-3">
          <Icon icon="lucide:percent" width={24} className="text-primary" />
          <h2 className="text-xl font-bold">Gestión de Descuentos</h2>
        </CardHeader>
        <CardBody>
          {/* Filtros */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <Input
                placeholder="Buscar producto"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                size="md"
                startContent={<Icon icon="lucide:search" width={18} />}
                className="w-full md:w-60"
                isClearable
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    endContent={<Icon icon="lucide:chevron-down" width={16} />}
                    className="w-full md:w-40"
                    size="md"
                  >
                    {filtroMarca || "Marca"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filtrar por marca"
                  selectionMode="single"
                  selectedKeys={filtroMarca ? [filtroMarca] : []}
                  onSelectionChange={(keys) => {
                    const seleccionado = Array.from(keys)[0]?.toString() || "";
                    setFiltroMarca(seleccionado);
                  }}
                  emptyContent="Todas"
                >
                  {marcas.map((m) => (
                    <DropdownItem key={m}>{m}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    endContent={<Icon icon="lucide:chevron-down" width={16} />}
                    className="w-full md:w-40"
                    size="md"
                  >
                    {filtroCategoria || "Categoría"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filtrar por categoría"
                  selectionMode="single"
                  selectedKeys={filtroCategoria ? [filtroCategoria] : []}
                  onSelectionChange={(keys) => {
                    const seleccionado = Array.from(keys)[0]?.toString() || "";
                    setFiltroCategoria(seleccionado);
                  }}
                  emptyContent="Todas"
                >
                  {categorias.map((c) => (
                    <DropdownItem key={c}>{c}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    endContent={<Icon icon="lucide:chevron-down" width={16} />}
                    className="w-full md:w-40"
                    size="md"
                  >
                    {filtroDescuento === "con"
                      ? "Con descuento"
                      : filtroDescuento === "sin"
                      ? "Sin descuento"
                      : "Descuento"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filtrar por descuento"
                  selectionMode="single"
                  selectedKeys={filtroDescuento ? [filtroDescuento] : []}
                  onSelectionChange={(keys) => {
                    const seleccionado = Array.from(keys)[0]?.toString() || "";
                    setFiltroDescuento(seleccionado);
                  }}
                >
                  <DropdownItem key="">Todos</DropdownItem>
                  <DropdownItem key="con">Con descuento</DropdownItem>
                  <DropdownItem key="sin">Sin descuento</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              {(filtroNombre || filtroMarca || filtroCategoria || filtroDescuento) && (
                <Button
                  variant="light"
                  color="default"
                  onClick={() => {
                    setFiltroNombre("");
                    setFiltroMarca("");
                    setFiltroCategoria("");
                    setFiltroDescuento("");
                  }}
                  startContent={<Icon icon="lucide:x" width={16} />}
                  size="md"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <Input
                type="number"
                min={1}
                max={99}
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                placeholder="Porcentaje (%)"
                size="md"
                style={{ width: 140 }}
              />
              <Button
                color="primary"
                onClick={handleApplyDiscount}
                disabled={aplicando}
                startContent={<Icon icon="lucide:check-circle" />}
                size="md"
                className="whitespace-nowrap"
              >
                Aplicar descuento
              </Button>
            </div>
          </div>
          {error && <Chip color="danger" className="mb-2">{error}</Chip>}
          {success && <Chip color="success" className="mb-2">{success}</Chip>}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Tabla de productos para descuentos">
              <TableHeader>
                <TableColumn>{""}</TableColumn>
                <TableColumn>Producto</TableColumn>
                <TableColumn>Marca</TableColumn>
                <TableColumn>Categoría</TableColumn>
                <TableColumn>Precio</TableColumn>
                <TableColumn>Descuento actual</TableColumn>
                <TableColumn>Precio con descuento</TableColumn>
              </TableHeader>
              <TableBody>
                {productosFiltrados.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell>
                      <Checkbox
                        isSelected={selected.includes(prod.id)}
                        onChange={() => handleSelect(prod.id)}
                      />
                    </TableCell>
                    <TableCell>{prod.nombre}</TableCell>
                    <TableCell>{prod.marca}</TableCell>
                    <TableCell>{prod.categoria}</TableCell>
                    <TableCell>{formatoCLP(prod.valor)}</TableCell>
                    <TableCell>
                      {prod.descuento && prod.descuento > 0 ? (
                        <Chip color="primary" size="sm">{prod.descuento}%</Chip>
                      ) : (
                        <span className="text-default-400">Sin descuento</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {prod.descuento && prod.descuento > 0 && prod.precio_con_descuento ? (
                        <span className="font-semibold text-success-600">{formatoCLP(prod.precio_con_descuento)}</span>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DiscountsPage;