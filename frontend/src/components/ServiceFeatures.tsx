import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card className="border-none shadow-sm" disableRipple>
    <CardBody className="gap-2">
      <div className="rounded-full bg-primary-100 p-3 w-12 h-12 flex items-center justify-center mb-2">
        <Icon icon={icon} className="text-primary-500 text-2xl" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-default-500">{description}</p>
    </CardBody>
  </Card>
);

const FEATURES = [
  {
    icon: "lucide:truck",
    title: "Envíos rápidos y de calidad",
    description: "Despachamos a todo Chile con rapidez y seguridad."
  },
  {
    icon: "lucide:shield-check",
    title: "Garantía de calidad",
    description: "Todos nuestros productos cuentan con garantía y respaldo."
  },
  {
    icon: "lucide:refresh-cw",
    title: "Cambios y devoluciones fáciles",
    description: "Tienes 30 días para cambios o devoluciones sin complicaciones."
  },
  {
    icon: "lucide:headphones",
    title: "Asesoría experta",
    description: "Recibe atención profesional de nuestros especialistas."
  }
];

const ServiceFeatures: React.FC = () => (
  <section className="mb-16">
    <h2 className="text-2xl font-bold mb-6">¿Por qué elegir FERREMAS?</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {FEATURES.map((feature, index) => (
        <FeatureCard
          key={feature.icon}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  </section>
);

export default ServiceFeatures;