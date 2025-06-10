import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_principal?: string | null;
}

const ICONOS_CATEGORIAS: Record<string, string> = {
  "Herramientas Eléctricas": "lucide:drill",
  "Herramientas Manuales": "lucide:hammer",
  "Materiales Eléctricos": "lucide:lightbulb",
  "Fijación y Tornillería": "lucide:screwdriver",
  "Jardín y Exteriores": "lucide:flower",
  "Pinturas y Adhesivos": "lucide:paintbrush",
  "Ferretería General": "lucide:package",
  "Seguridad Industrial": "lucide:shield",
};

interface CategoryCardProps {
  nombre: string;
  icon: string;
  image?: string | null;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ nombre, icon, image, onClick }) => (
  <Card className="w-full h-full" isPressable disableRipple onClick={onClick}>
    <CardBody className="overflow-hidden p-0">
      <div className="relative h-48 overflow-hidden flex items-center justify-center bg-default-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        {image ? (
          <img
            src={image}
            alt={nombre}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon icon={icon} className="text-default-400" style={{ fontSize: 64 }} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon={icon} className="text-white text-xl" />
              <h3 className="text-white font-semibold text-lg">{nombre}</h3>
            </div>
            <Button
              isIconOnly
              variant="flat"
              color="default"
              radius="full"
              size="sm"
              className="bg-white/20 backdrop-blur-md"
            >
              <Icon icon="lucide:chevron-right" />
            </Button>
          </div>
        </div>
      </div>
    </CardBody>
  </Card>
);

const FeaturedCategories: React.FC<{ navigateTo?: (page: string, categoria?: string) => void }> = ({ navigateTo }) => {
  const [categorias, setCategorias] = React.useState<Categoria[]>([]);

  React.useEffect(() => {
    fetch("http://localhost:8000/api/categorias/")
      .then(res => res.json())
      .then(data => setCategorias(data));
  }, []);

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Categorías destacadas</h2>
        <Button
          variant="light"
          color="primary"
          endContent={<Icon icon="lucide:arrow-right" />}
          onClick={() => navigateTo && navigateTo("catalogo")}
        >
          Ver todas
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categorias.map((cat) => (
          <CategoryCard
            key={cat.id}
            nombre={cat.nombre}
            icon={ICONOS_CATEGORIAS[cat.nombre] || "lucide:package"}
            image={
              cat.imagen_principal && cat.imagen_principal.trim() !== ""
                ? (cat.imagen_principal.startsWith("http")
                  ? cat.imagen_principal
                  : `http://localhost:8000${cat.imagen_principal}`)
                : null
            }
            onClick={() => navigateTo && navigateTo("catalogo", cat.nombre)}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;