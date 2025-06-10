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
  Input,
  Select,
  SelectItem,
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

const OrdersTable: React.FC = () => {
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PedidoStatus | "">("");
  const rowsPerPage = 10;

  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/admin/orders/", { credentials: "include" })
      .then(async (res) => {
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

  const filteredPedidos = pedidos.filter((pedido) => {
    const searchLower = search.toLowerCase();
    const clienteLower = pedido.cliente_nombre.toLowerCase();
    const codigoLower = pedido.codigo.toLowerCase();

    const matchesSearch =
      search === "" || clienteLower.includes(searchLower) || codigoLower.includes(searchLower);

    const matchesStatus = statusFilter === "" || pedido.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginated = filteredPedidos.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por código o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
            startContent={<Icon icon="lucide:search" width={16} height={16} />}
          />
          <Select
            selectedKeys={statusFilter ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as PedidoStatus | "";
              setStatusFilter(val);
            }}
            size="sm"
          >
            <>
              <SelectItem key="">Todos</SelectItem>
              {Object.entries(statusLabelMap).map(([key, label]) => (
                <SelectItem key={key}>{label}</SelectItem>
              ))}
            </>
          </Select>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="text-center text-danger-500 py-8">No hay órdenes disponibles.</div>
        ) : (
          <Table
            removeWrapper
            aria-label="Orders table"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={Math.ceil(filteredPedidos.length / rowsPerPage)}
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
                    <Chip color={statusColorMap[pedido.estado]} size="sm" variant="flat">
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

export default OrdersTable;