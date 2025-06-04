import React from "react";
import { Card, CardBody, CardFooter, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  isNew?: boolean;
  isBestSeller?: boolean;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Card className="w-full" isPressable disableRipple>
      <CardBody className="p-0 overflow-hidden">
        <div className="relative">
          {product.isNew && (
            <Chip 
              color="primary" 
              variant="flat" 
              size="sm" 
              className="absolute top-2 left-2 z-10"
            >
              New
            </Chip>
          )}
          {product.isBestSeller && (
            <Chip 
              color="warning" 
              variant="flat" 
              size="sm" 
              className="absolute top-2 left-2 z-10"
            >
              Best Seller
            </Chip>
          )}
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full aspect-square object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-foreground/90 line-clamp-1">{product.name}</h3>
          <div className="flex items-center mt-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Icon 
                key={i} 
                icon={i < product.rating ? "lucide:star" : "lucide:star"} 
                className={i < product.rating ? "text-warning" : "text-default-300"} 
                size={14} 
              />
            ))}
            <span className="text-default-500 text-xs ml-1">({Math.floor(Math.random() * 500) + 10})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-default-500 text-sm line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button 
          fullWidth 
          color="primary" 
          variant="flat"
          startContent={<Icon icon="lucide:shopping-cart" size={18} />}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export const PopularProducts: React.FC = () => {
  const products: Product[] = [
    {
      id: 1,
      name: "Professional Cordless Drill Set",
      price: 129.99,
      originalPrice: 159.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=6",
      isBestSeller: true
    },
    {
      id: 2,
      name: "Premium Tool Box with Organizer",
      price: 79.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=7"
    },
    {
      id: 3,
      name: "Heavy Duty Work Gloves",
      price: 24.99,
      originalPrice: 34.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=8"
    },
    {
      id: 4,
      name: "Precision Screwdriver Set",
      price: 49.99,
      rating: 5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=9",
      isNew: true
    },
    {
      id: 5,
      name: "Digital Laser Measuring Tool",
      price: 89.99,
      originalPrice: 109.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=10"
    },
    {
      id: 6,
      name: "Adjustable Wrench Set",
      price: 39.99,
      rating: 4.5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=11"
    },
    {
      id: 7,
      name: "Smart Home Electrical Kit",
      price: 149.99,
      rating: 5,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=12",
      isNew: true
    },
    {
      id: 8,
      name: "Professional Safety Helmet",
      price: 34.99,
      rating: 4,
      image: "https://img.heroui.chat/image/tools?w=400&h=400&u=13"
    }
  ];

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Popular Products</h2>
        <Button 
          variant="light" 
          color="primary"
          endContent={<Icon icon="lucide:arrow-right" />}
        >
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};