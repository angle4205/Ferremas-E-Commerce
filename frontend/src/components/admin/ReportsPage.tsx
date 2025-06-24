import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { Icon } from "@iconify/react";

const formatoCLP = (valor: number) =>
  valor.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 });

interface FinancialReportRow {
  fecha: string;
  total_ordenes: number;
  total_ingresos: number;
  total_canceladas: number;
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [report, setReport] = useState<FinancialReportRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cargar resumen financiero para mostrar en tabla
  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/admin/reportes/financieros/", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo cargar el reporte financiero");
        return res.json();
      })
      .then((data) => {
        // Espera un array de objetos con fecha, total_ordenes, total_ingresos, total_canceladas
        setReport(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => {
        setReport([]);
        setError("No se pudo cargar el reporte financiero.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Descargar Excel
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(
        "http://localhost:8000/api/admin/reportes/financieros_xlsx/?export=xlsx",
        { credentials: "include" }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `reporte_financiero_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e: any) {
      alert("Error al descargar el archivo: " + e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:file-text" width={24} height={24} className="text-primary" />
            <h2 className="text-xl font-semibold">Reportes Financieros</h2>
          </div>
          <Button
            color="primary"
            startContent={<Icon icon="lucide:download" />}
            isLoading={downloading}
            onClick={handleDownload}
          >
            Descargar Excel
          </Button>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-default-600">
            Visualiza el resumen financiero de las órdenes y descarga el informe detallado en Excel.
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-danger-500 text-center py-8">{error}</div>
          ) : report.length === 0 ? (
            <div className="text-center text-default-400 py-8">No hay datos de reportes financieros.</div>
          ) : (
            <Table aria-label="Tabla de resumen financiero">
              <TableHeader>
                <TableColumn>Fecha</TableColumn>
                <TableColumn>Órdenes</TableColumn>
                <TableColumn>Ingresos</TableColumn>
                <TableColumn>Canceladas</TableColumn>
              </TableHeader>
              <TableBody>
                {report.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell>{row.total_ordenes}</TableCell>
                    <TableCell>{formatoCLP(row.total_ingresos)}</TableCell>
                    <TableCell>{row.total_canceladas}</TableCell>
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

export default ReportsPage;