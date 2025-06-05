import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface CategoryCardProps {
  title: string;
  icon: string;
  image: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon, image }) => {
  return (
    <Card className="w-full h-full" isPressable disableRipple>
      <CardBody className="overflow-hidden p-0">
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon={icon} className="text-white text-xl" />
                <h3 className="text-white font-semibold text-lg">{title}</h3>
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
};

export const FeaturedCategories: React.FC = () => {
  // Categorías reales de Ferremas
  const categories = [
    { 
      title: "Herramientas Eléctricas", 
      icon: "lucide:drill", 
      image: "https://img.heroui.chat/image/tools?w=400&h=300&u=2"
    },
    { 
      title: "Herramientas Manuales", 
      icon: "lucide:hammer", 
      image: "https://img.heroui.chat/image/tools?w=400&h=300&u=3"
    },
    { 
      title: "Materiales Eléctricos", 
      icon: "lucide:lightbulb", 
      image: "https://img.heroui.chat/image/tools?w=400&h=300&u=4"
    },
    { 
      title: "Fijación y Tornillería", 
      icon: "lucide:screwdriver", 
      image: "https://img.heroui.chat/image/tools?w=400&h=300&u=5"
    },
    { 
      title: "Jardín y Exteriores", 
      icon: "lucide:flower", 
      image: "https://img.heroui.chat/image/landscape?w=400&h=300&u=1"
    },
    { 
      title: "Pinturas y Adhesivos", 
      icon: "lucide:paintbrush", 
      image: "https://img.heroui.chat/image/paint?w=400&h=300&u=1"
    },
    { 
      title: "Ferretería General", 
      icon: "lucide:package", 
      image: "https://img.heroui.chat/image/tools?w=400&h=300&u=6"
    },
    { 
      title: "Seguridad Industrial", 
      icon: "lucide:shield", 
      image: "https://img.heroui.chat/image/helmet?w=400&h=300&u=1"
    }
  ];

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Categorías destacadas</h2>
        <Button 
          variant="light" 
          color="primary"
          endContent={<Icon icon="lucide:arrow-right" />}
        >
          Ver todas
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((category, index) => (
          <CategoryCard 
            key={index} 
            title={category.title} 
            icon={category.icon} 
            image={category.image} 
          />
        ))}
      </div>
    </section>
  );
};