import React from "react";
import { Button, Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Image } from "@heroui/react";

interface HeroSectionProps {
  onVerCatalogo?: () => void;
}

const IMAGES = [
  "https://eccommerce-ferreteria-cl.s3.us-east-2.amazonaws.com/imagenes/slider/2804085408_SEGUIMOS_DE_PROMO_ToughBuilt_Banner_1280x400_ABRIL_2025.jpg",
  "https://eccommerce-ferreteria-cl.s3.us-east-2.amazonaws.com/imagenes/slider/0906025010_Slider-Principal.jpg",
];

const HeroCarousel: React.FC = () => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[16/5] rounded-lg overflow-hidden shadow-lg mt-4">
      <Image
        alt={`Imagen carrusel ${index + 1}`}
        src={IMAGES[index]}
        isBlurred
        width="100%"
        height="100%"
        className="w-full h-full object-cover transition-all duration-700"
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {IMAGES.map((_, i) => (
          <span
            key={i}
            className={`block w-3 h-3 rounded-full ${i === index ? "bg-yellow-400" : "bg-white/60"} border border-white cursor-pointer`}
            style={{ transition: "background 0.3s" }}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ onVerCatalogo }) => (
  <Card className="bg-primary-500 text-white border-none overflow-hidden mb-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 flex flex-col items-start gap-4">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-left w-full">
        Todo para tu proyecto, en un solo lugar
      </h1>
      <div className="flex flex-wrap gap-4 mb-6 w-full">
        <Button
          color="default"
          variant="solid"
          size="lg"
          endContent={<Icon icon="lucide:arrow-right" />}
          onClick={onVerCatalogo}
        >
          Ver catálogo
        </Button>
      </div>
      <p
        className="text-lg max-w-2xl font-medium bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent animate-gradient-x mb-2 text-left w-full"
        style={{
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "200% 100%",
          animation: "gradient-x 3s ease-in-out infinite",
        }}
      >
        En FERREMAS encuentras herramientas, materiales y asesoría para construcción y ferretería. Más de 40 años acompañando a Chile con calidad y confianza.
      </p>
      <HeroCarousel />
    </div>
    <style>
      {`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}
    </style>
  </Card>
);

export default HeroSection;