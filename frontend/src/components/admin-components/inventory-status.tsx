import React from "react";
import { Card, CardHeader, CardBody, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CategoriaInventario {
  categoria: string;
  stock_total: number;
  stock_disponible: number;
}

const CategoriaItem = ({ categoria, stock_total, stock_disponible }: CategoriaInventario) => {
  const percentage = stock_total > 0 ? Math.round((stock_disponible / stock_total) * 100) : 0;
  let color: "success" | "warning" | "danger" = "success";
  if (percentage < 20) {
    color = "danger";
  } else if (percentage < 50) {
    color = "warning";
  }
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center mb-2">
        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
          <Icon icon="lucide:package" width={20} height={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">{categoria}</p>
            </div>
            <p className="text-sm font-medium">{stock_disponible}/{stock_total}</p>
          </div>
          <Progress 
            color={color} 
            size="sm" 
            value={percentage} 
            className="mt-2" 
          />
        </div>
      </div>
    </div>
  );
};

type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  stock: number;
  valor: number;
  imagen_principal: string;
  disponible: boolean;
};

export const InventoryStatus = () => {
  const [categorias, setCategorias] = React.useState<CategoriaInventario[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/productos/", { credentials: "include" })
      .then(async res => {
        if (!res.ok) throw new Error("No se pudo cargar el inventario");
        return res.json();
      })
      .then((productos: Producto[]) => {
        // Agrupar productos por categoría y sumar stock
        const agrupado: { [cat: string]: { total: number; disponible: number } } = {};
        productos.forEach(prod => {
          if (!agrupado[prod.categoria]) agrupado[prod.categoria] = { total: 0, disponible: 0 };
          agrupado[prod.categoria].total += prod.stock ?? 0;
          if (prod.disponible) agrupado[prod.categoria].disponible += prod.stock ?? 0;
        });
        const cats: CategoriaInventario[] = Object.entries(agrupado).map(([categoria, datos]) => ({
          categoria,
          stock_total: datos.total,
          stock_disponible: datos.disponible,
        }));
        setCategorias(cats);
      })
      .catch(() => setCategorias([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <h3 className="text-lg font-semibold">Estado de Inventario</h3>
        <span className="text-default-500 text-sm">{categorias.length} categorías</span>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : categorias.length === 0 ? (
          <div className="text-center text-danger-500 py-8">No hay datos de inventario.</div>
        ) : (
          categorias.map((cat, idx) => (
            <CategoriaItem
              key={cat.categoria}
              categoria={cat.categoria}
              stock_total={cat.stock_total}
              stock_disponible={cat.stock_disponible}
            />
          ))
        )}
      </CardBody>
    </Card>
  );
};