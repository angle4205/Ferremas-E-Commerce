import React from "react";
import { Button, Card } from "@heroui/react";
import { Icon } from "@iconify/react";

const HeroSection: React.FC = () => (
  <Card className="bg-primary-500 text-white border-none overflow-hidden mb-12">
    <div className="flex flex-col lg:flex-row items-center">
      <div className="p-8 lg:p-12 lg:w-1/2 z-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Todo para tu proyecto, en un solo lugar
        </h1>
        <p className="text-lg opacity-90 mb-8 max-w-md">
          En FERREMAS encuentras herramientas, materiales y asesoría para construcción y ferretería. Más de 40 años acompañando a Chile con calidad y confianza.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button 
            color="default" 
            variant="solid" 
            size="lg"
            endContent={<Icon icon="lucide:arrow-right" />}
          >
            Ver catálogo
          </Button>
          <Button 
            color="default" 
            variant="bordered" 
            size="lg"
          >
            Contáctanos
          </Button>
        </div>
      </div>
      <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-transparent lg:hidden z-10"></div>
        <img 
          src="https://img.heroui.chat/image/tools?w=800&h=600&u=1" 
          alt="Colección de herramientas profesionales" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </Card>
);

export default HeroSection;