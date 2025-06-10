import React from "react";
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
  Chip,
  Button,
  Pagination,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";

type PedidoStatus = "ENTREGADO" | "ENVIADO" | "PREPARACION" | "CANCELADO" | "SOLICITADO" | "LISTO_RETIRO";

interface Pedido {
  id: number;
  codigo: string;
  cliente_nombre: string;
  fecha_creacion: string;
  total: number;
  estado: PedidoStatus;
  items_count: number;
}

const statusColorMap: Record<PedidoStatus, "success" | "primary" | "danger" | "warning" | "default"> = {
  ENTREGADO: "success",
  ENVIADO: "primary",
  PREPARACION: "warning",
  CANCELADO: "danger",
  SOLICITADO: "default",
  LISTO_RETIRO: "primary",
};

const statusLabelMap: Record<PedidoStatus, string> = {
  ENTREGADO: "Entregado",
  ENVIADO: "Enviado",
  PREPARACION: "Preparación",
  CANCELADO: "Cancelado",
  SOLICITADO: "Solicitado",
  LISTO_RETIRO: "Listo para retiro",
};

const formatoCLP = (valor: number) =>
  valor.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 });

const RecentOrders: React.FC = () => {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 5;

  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/admin/orders/", { credentials: "include" })
      .then(async res => {
        if (!res.ok) throw new Error("No se pudo cargar las órdenes");
        return res.json();
      })
      .then((data: any) => {
        const pedidosRaw = Array.isArray(data) ? data : data.results || [];
        const pedidos: Pedido[] = pedidosRaw.map((p: any) => ({
          id: p.id,
          codigo: p.codigo || `#ORD-${p.id}`,
          cliente_nombre: p.cliente?.nombre || p.cliente_nombre || "Cliente",
          fecha_creacion: p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString("es-CL") : "",
          total: p.total ?? 0,
          estado: p.estado,
          items_count: p.items?.length ?? p.items_count ?? 0,
        }));
        setPedidos(pedidos);
      })
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, []);

  const paginated = pedidos.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <h3 className="text-lg font-semibold">Órdenes recientes</h3>
        <Button
          color="primary"
          variant="flat"
          size="sm"
          endContent={<Icon icon="lucide:arrow-right" width={16} height={16} />}
        >
          Ver todas
        </Button>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : pedidos.length === 0 ? (
          <div className="text-center text-danger-500 py-8">No hay órdenes recientes.</div>
        ) : (
          <Table
            removeWrapper
            aria-label="Recent orders table"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={Math.ceil(pedidos.length / rowsPerPage)}
                  onChange={setPage}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>ORDEN</TableColumn>
              <TableColumn>CLIENTE</TableColumn>
              <TableColumn>FECHA</TableColumn>
              <TableColumn>TOTAL</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {paginated.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{pedido.codigo}</span>
                      <span className="text-default-400 text-xs">{pedido.items_count} items</span>
                    </div>
                  </TableCell>
                  <TableCell>{pedido.cliente_nombre}</TableCell>
                  <TableCell>{pedido.fecha_creacion}</TableCell>
                  <TableCell>{formatoCLP(pedido.total)}</TableCell>
                  <TableCell>
                    <Chip
                      color={statusColorMap[pedido.estado]}
                      size="sm"
                      variant="flat"
                    >
                      {statusLabelMap[pedido.estado]}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button isIconOnly size="sm" variant="light">
                        <Icon icon="lucide:eye" width={16} height={16} />
                      </Button>
                      <Button isIconOnly size="sm" variant="light">
                        <Icon icon="lucide:printer" width={16} height={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentOrders;