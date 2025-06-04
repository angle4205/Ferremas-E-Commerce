import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
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
};

export const ServiceFeatures: React.FC = () => {
  const features = [
    {
      icon: "lucide:truck",
      title: "Free Delivery",
      description: "Free shipping on all orders over $75"
    },
    {
      icon: "lucide:shield-check",
      title: "Quality Guarantee",
      description: "All products come with a 2-year warranty"
    },
    {
      icon: "lucide:refresh-cw",
      title: "Easy Returns",
      description: "30-day money back guarantee"
    },
    {
      icon: "lucide:headphones",
      title: "Expert Support",
      description: "Professional advice from our specialists"
    }
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Why Shop With Us</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
};