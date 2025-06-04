import React from "react";
import { Button, Card } from "@heroui/react";
import { Icon } from "@iconify/react";

export const HeroSection: React.FC = () => {
  return (
    <Card className="bg-primary-500 text-white border-none overflow-hidden mb-12">
      <div className="flex flex-col lg:flex-row items-center">
        <div className="p-8 lg:p-12 lg:w-1/2 z-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Professional Tools for Every Project
          </h1>
          <p className="text-lg opacity-90 mb-8 max-w-md">
            Find the right equipment for your next home improvement project with our premium selection of tools and hardware.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              color="default" 
              variant="solid" 
              size="lg"
              endContent={<Icon icon="lucide:arrow-right" />}
            >
              Shop Now
            </Button>
            <Button 
              color="default" 
              variant="bordered" 
              size="lg"
            >
              View Deals
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-transparent lg:hidden z-10"></div>
          <img 
            src="https://img.heroui.chat/image/tools?w=800&h=600&u=1" 
            alt="Professional tools collection" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </Card>
  );
};