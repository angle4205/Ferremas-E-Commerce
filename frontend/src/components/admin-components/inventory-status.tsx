import React from "react";
import { Card, CardHeader, CardBody, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CategoriaInventario {
  categoria: string;
  stock_total: number;
}

const CategoriaItem = ({ categoria, stock_total, promedio_stock }: { categoria: string; stock_total: number; promedio_stock: number }) => {
  const percentage = promedio_stock > 0 ? Math.round((stock_total / promedio_stock) * 100) : 0;
  let color: "success" | "warning" | "danger" = "success";
  if (percentage < 50) {
    color = "danger";
  } else if (percentage < 100) {
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
            <p className="text-sm font-medium">{stock_total}</p> {/* Mostrar solo el número */}
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
};

export const InventoryStatus = () => {
  const [categorias, setCategorias] = React.useState<CategoriaInventario[]>([]);
  const [promedioStock, setPromedioStock] = React.useState(0);
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
        const agrupado: { [cat: string]: number } = {};
        productos.forEach(prod => {
          if (!agrupado[prod.categoria]) agrupado[prod.categoria] = 0;
          agrupado[prod.categoria] += prod.stock ?? 0;
        });

        const categoriasData: CategoriaInventario[] = Object.entries(agrupado).map(([categoria, stock_total]) => ({
          categoria,
          stock_total,
        }));

        const totalStock = categoriasData.reduce((sum, cat) => sum + cat.stock_total, 0);
        const promedio = categoriasData.length > 0 ? totalStock / categoriasData.length : 0;

        setCategorias(categoriasData);
        setPromedioStock(promedio);
      })
      .catch(() => {
        setCategorias([]);
        setPromedioStock(0);
      })
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
          categorias.map((cat) => (
            <CategoriaItem
              key={cat.categoria}
              categoria={cat.categoria}
              stock_total={cat.stock_total}
              promedio_stock={promedioStock}
            />
          ))
        )}
      </CardBody>
    </Card>
  );
};