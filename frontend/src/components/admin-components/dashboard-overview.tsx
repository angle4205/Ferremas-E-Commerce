import React from "react";
import { Card, CardBody, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  change: string;
  isPositive: boolean;
}

const StatCard = ({ title, value, icon, change, isPositive }: StatCardProps) => {
  return (
    <Card>
      <CardBody>
        <div className="flex justify-between">
          <div>
            <p className="text-default-500 text-sm">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon icon={icon} width={24} height={24} className="text-primary" />
          </div>
        </div>
        <div className="flex items-center mt-4 text-sm">
          <div className={`flex items-center ${isPositive ? 'text-success' : 'text-danger'}`}>
            <Icon 
              icon={isPositive ? 'lucide:trending-up' : 'lucide:trending-down'} 
              width={16} 
              height={16} 
            />
            <span className="ml-1">{change}</span>
          </div>
          <span className="text-default-400 ml-2">vs mes anterior</span>
        </div>
      </CardBody>
    </Card>
  );
};

type OverviewData = {
  total_revenue: number;
  revenue_change: number;
  orders: number;
  orders_change: number;
  customers: number;
  customers_change: number;
  inventory_value: number;
  inventory_change: number;
};

export const DashboardOverview = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<OverviewData | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/admin/overview/", { credentials: "include" })
      .then(async res => {
        if (!res.ok) throw new Error("No se pudo cargar el resumen");
        return res.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[20vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-danger-500 text-center py-8">
        No se pudo cargar el resumen del dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Resumen general</h1>
        <div className="flex items-center gap-2">
          <span className="text-default-500 text-sm">Período:</span>
          <select className="bg-content2 text-foreground border border-divider rounded-md px-3 py-1 text-sm" disabled>
            <option>Últimos 30 días</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos totales" 
          value={`$${data.total_revenue.toLocaleString("es-CL")}`} 
          icon="lucide:dollar-sign" 
          change={`${Math.abs(data.revenue_change).toFixed(1)}%`} 
          isPositive={data.revenue_change >= 0} 
        />
        <StatCard 
          title="Órdenes" 
          value={data.orders.toLocaleString("es-CL")} 
          icon="lucide:shopping-cart" 
          change={`${Math.abs(data.orders_change).toFixed(1)}%`} 
          isPositive={data.orders_change >= 0} 
        />
        <StatCard 
          title="Clientes" 
          value={data.customers.toLocaleString("es-CL")} 
          icon="lucide:users" 
          change={`${Math.abs(data.customers_change).toFixed(1)}%`} 
          isPositive={data.customers_change >= 0} 
        />
        <StatCard 
          title="Valor inventario" 
          value={`$${data.inventory_value.toLocaleString("es-CL")}`} 
          icon="lucide:package" 
          change={`${Math.abs(data.inventory_change).toFixed(1)}%`} 
          isPositive={data.inventory_change >= 0} 
        />
      </div>
    </div>
  );
};