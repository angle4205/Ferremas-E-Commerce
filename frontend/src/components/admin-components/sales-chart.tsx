import React from "react";
import { Card, CardHeader, CardBody, Tabs, Tab } from "@heroui/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// Define chart data types
type ChartData = {
  name: string;
  revenue: number;
  orders: number;
};

// Utility function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const SalesChart = () => {
  const [selected, setSelected] = React.useState<"weekly" | "monthly">("weekly");
  const [data, setData] = React.useState<ChartData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/admin/orders/", { credentials: "include" })
      .then(async res => {
        if (!res.ok) throw new Error("No se pudo cargar las órdenes");
        return res.json();
      })
      .then((raw) => {
        const pedidosRaw = Array.isArray(raw) ? raw : raw.results || [];
        const agrupado: Record<string, { revenue: number; orders: number }> = {};

        pedidosRaw.forEach((p: any) => {
          const fecha = p.fecha_creacion ? new Date(p.fecha_creacion) : null;
          if (!fecha) return;
          let key = "";
          if (selected === "weekly") {
            key = fecha.toISOString().slice(0, 10);
          } else {
            key = fecha.getFullYear() + "-" + String(fecha.getMonth() + 1).padStart(2, "0");
          }
          if (!agrupado[key]) agrupado[key] = { revenue: 0, orders: 0 };
          // Asegura que p.total sea un número válido
          const total = Number(p.total);
          if (!isNaN(total) && isFinite(total)) {
            agrupado[key].revenue += total;
            agrupado[key].orders += 1;
          }
        });

        const sortedKeys = Object.keys(agrupado).sort();
        const chartData: ChartData[] = sortedKeys.map(key => ({
          name: key,
          revenue: agrupado[key].revenue,
          orders: agrupado[key].orders,
        }));

        setData(chartData);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  }, [selected]);

  // Suma solo valores válidos para evitar bugs
  const totalRevenue = data.reduce((sum, item) => {
    const val = Number(item.revenue);
    return isNaN(val) || !isFinite(val) ? sum : sum + val;
  }, 0);

  const totalOrders = data.reduce((sum, item) => {
    const val = Number(item.orders);
    return isNaN(val) || !isFinite(val) ? sum : sum + val;
  }, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Sales Overview</h3>
        </div>
        <Tabs 
          selectedKey={selected} 
          onSelectionChange={(key) => setSelected(key as "weekly" | "monthly")}
          size="sm"
          color="primary"
          variant="light"
        >
          <Tab key="weekly" title="Weekly" />
          <Tab key="monthly" title="Monthly" />
        </Tabs>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex justify-center items-center h-[300px] text-default-400">
            Cargando...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--heroui-primary-500))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--heroui-primary-500))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--heroui-divider))" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--heroui-foreground-500))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--heroui-foreground-500))' }}
                tickFormatter={(value) => formatCurrency(Number(value))}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "revenue") {
                    return [formatCurrency(Number(value)), "Ingresos"];
                  }
                  return [value, "Órdenes"];
                }}
                labelFormatter={(label) => {
                  if (selected === "weekly") {
                    return new Date(label).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
                  }
                  const [year, month] = label.split("-");
                  return `${month}/${year}`;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--heroui-primary))"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        <div className="flex justify-between mt-4 px-4">
          <div>
            <p className="text-default-500 text-sm">Ingresos totales</p>
            <p className="text-xl font-semibold">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-default-500 text-sm">Órdenes totales</p>
            <p className="text-xl font-semibold">
              {totalOrders}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};